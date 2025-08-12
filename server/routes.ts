import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, authenticateAdmin } from "./middleware/auth";
import { aiVerificationService } from "./services/ai-verification";
import { blockchainService } from "./services/blockchain";
import { insertUserSchema, insertGreenActionSchema, insertEcoTokenTransactionSchema } from "@shared/schema";
import { verifyFirebaseToken, optionalAuth, configureCORS, AuthenticatedRequest } from "./middleware/firebaseAuth";
import { verifyUserAction } from "./services/verifyAction";
import { mintTokens, burnTokens, getTokenBalance } from "./lib/blockchain";
import { getFirestore, MockFirestore, isMockMode } from "./lib/firebase";
import { chatWithAssistant } from "./lib/aiClient";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/me", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    res.json(req.user);
  });

  app.get("/api/users", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/stats", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Green actions routes
  app.post("/api/green-actions", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const actionData = insertGreenActionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const action = await storage.createGreenAction(actionData);
      
      // Trigger AI verification
      const verificationResult = await aiVerificationService.verifyGreenAction({
        actionId: action.id,
        actionType: action.category,
        description: action.description || '',
        proofImages: action.proofImages || []
      });

      // Update action with verification result
      const updatedAction = await storage.updateGreenAction(action.id, {
        status: verificationResult.verified ? 'verified' : 'rejected',
        verificationData: verificationResult,
        verifiedAt: verificationResult.verified ? new Date() : undefined,
        verifiedBy: 'AI'
      });

      // If verified, mint tokens
      if (verificationResult.verified && updatedAction) {
        const transaction = await storage.createTokenTransaction({
          userId: req.user.id,
          actionId: action.id,
          type: 'mint',
          amount: action.tokensEarned,
          status: 'pending'
        });

        // Trigger blockchain minting (mock)
        const mintResult = await blockchainService.mintTokens(req.user.firebaseUid, action.tokensEarned);
        
        if (mintResult.success) {
          await storage.updateTokenTransaction(transaction.id, {
            status: 'confirmed',
            blockchainTxHash: mintResult.txHash
          });

          // Update user balance
          const currentBalance = parseFloat(req.user.ecoTokenBalance);
          const newBalance = currentBalance + parseFloat(action.tokensEarned);
          await storage.updateUser(req.user.id, {
            ecoTokenBalance: newBalance.toFixed(8),
            totalActionsCompleted: req.user.totalActionsCompleted + 1
          });
        }
      }

      res.json(updatedAction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/green-actions", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const actions = await storage.getAllGreenActions();
      res.json(actions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/green-actions/recent", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const actions = await storage.getRecentGreenActions(limit);
      
      // Enrich with user data
      const enrichedActions = await Promise.all(
        actions.map(async (action) => {
          const user = await storage.getUser(action.userId);
          return {
            ...action,
            user: user ? {
              name: user.name,
              email: user.email,
              avatar: user.avatar
            } : null
          };
        })
      );
      
      res.json(enrichedActions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/green-actions/stats", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await storage.getGreenActionsStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/green-actions/user/:userId", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Ensure user can only access their own actions unless admin
      if (userId !== req.user.id && !req.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const actions = await storage.getGreenActionsByUser(userId);
      res.json(actions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Token routes
  app.get("/api/tokens/stats", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await storage.getTokenStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tokens/user/:userId", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Ensure user can only access their own transactions unless admin
      if (userId !== req.user.id && !req.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactions = await storage.getTokenTransactionsByUser(userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/dashboard/stats", authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [userStats, actionStats, tokenStats] = await Promise.all([
        storage.getUserStats(),
        storage.getGreenActionsStats(),
        storage.getTokenStats()
      ]);

      const aiStatus = aiVerificationService.getServiceStatus();
      const blockchainStatus = blockchainService.getNetworkStatus();

      res.json({
        users: {
          total: userStats.total,
          growth: userStats.growth
        },
        actions: {
          total: actionStats.total,
          growth: actionStats.growth,
          byCategory: actionStats.byCategory
        },
        tokens: {
          totalMinted: tokenStats.totalMinted,
          growth: tokenStats.growth
        },
        ai: aiStatus,
        blockchain: blockchainStatus,
        verification: {
          total: actionStats.total,
          successRate: aiStatus.successRate
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // System status routes
  app.get("/api/status/firebase", async (req, res) => {
    res.json({
      status: "Operational",
      auth: { status: "Online" },
      firestore: { status: "Online" },
      responseTime: "45ms"
    });
  });

  app.get("/api/status/blockchain", async (req, res) => {
    try {
      const status = blockchainService.getNetworkStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/status/ai", async (req, res) => {
    try {
      const status = aiVerificationService.getServiceStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
