import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, authenticateAdmin } from "./middleware/auth";
import { aiVerificationService } from "./services/ai-verification";
import { blockchainService } from "./services/blockchain";
import { insertUserSchema, insertGreenActionSchema, insertEcoTokenTransactionSchema } from "@shared/schema";
import { verifyFirebaseToken, optionalAuth, configureCORS, AuthenticatedRequest } from "./middleware/firebaseAuth";
import { verifyUserAction } from "./services/verifyAction";
import { mintTokens, burnTokens, getTokenBalance, isBlockchainMockMode } from "./lib/blockchain";
import { getFirestore, MockFirestore, isMockMode } from "./lib/firebase";
import { chatWithAssistant, isAIMockMode } from "./lib/aiClient";
import database from "./lib/database";
import fileUploadService, { upload, processUploadedFile, validateCarbonFile } from "./lib/fileUpload";
import mlService, { calculateCarbonWithML, analyzeImageWithML, getMLRecommendations } from "./lib/mlService";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {

  // Configure CORS
  app.use(configureCORS());

  // Profile API - GET /api/profile
  app.get("/api/profile", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.uid;

      if (isMockMode()) {
        // Mock user profile
        const mockProfile = {
          uid: userId,
          name: req.user!.name || 'Mock User',
          email: req.user!.email || 'mock@example.com',
          photoURL: '',
          walletAddress: null,
          totalTokens: 247,
          carbonSavedKg: 156.7,
          joinedAt: new Date('2024-01-15').toISOString()
        };
        res.json(mockProfile);
      } else {
        const firestore = getFirestore();
        const userDoc = await firestore.collection('users').doc(userId).get();

        if (!userDoc.exists) {
          res.status(404).json({ error: 'User profile not found' });
          return;
        }

        res.json(userDoc.data());
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Submit Action - POST /api/actions/submit
  app.post("/api/actions/submit", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, data, imageUrl } = req.body;
      const userId = req.user!.uid;

      const actionData = {
        id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        uid: userId,
        type,
        data,
        imageUrl,
        status: 'pending',
        submitAt: new Date(),
        verifyAt: null,
        tokensIssued: 0,
        predictedCO2Kg: 0,
        txHash: null
      };

      if (isMockMode()) {
        await MockFirestore.collection('actions').doc(actionData.id).set(actionData);
      } else {
        const firestore = getFirestore();
        await firestore.collection('actions').doc(actionData.id).set(actionData);
      }

      res.json({
        success: true,
        actionId: actionData.id,
        status: 'pending',
        message: 'Action submitted for verification'
      });
    } catch (error: any) {
      console.error('Action submission error:', error);
      res.status(500).json({ error: 'Failed to submit action' });
    }
  });

  // Verify Action - POST /api/actions/verify
  app.post("/api/actions/verify", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { actionId } = req.body;

      if (!actionId) {
        res.status(400).json({ error: 'Action ID required' });
        return;
      }

      const result = await verifyUserAction(actionId);
      res.json({
        ...result,
        aiAnalysis: result.aiAnalysis || 'Verification completed'
      });
    } catch (error: any) {
      console.error('Action verification error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Leaderboard - GET /api/leaderboard
  app.get("/api/leaderboard", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockMode()) {
        // Mock leaderboard data
        const mockLeaderboard = {
          period: 'monthly',
          entries: [
            { uid: 'user1', name: 'Alice Green', score: 342, tokens: 1240, carbonSaved: 890.5 },
            { uid: 'user2', name: 'Bob Earth', score: 298, tokens: 987, carbonSaved: 654.2 },
            { uid: 'user3', name: 'Carol Forest', score: 267, tokens: 876, carbonSaved: 543.1 },
            { uid: 'user4', name: 'David Ocean', score: 234, tokens: 765, carbonSaved: 432.8 },
            { uid: 'user5', name: 'Eva Solar', score: 198, tokens: 654, carbonSaved: 321.6 }
          ]
        };
        res.json(mockLeaderboard);
      } else {
        const firestore = getFirestore();
        const leaderboardDoc = await firestore.collection('leaderboard').doc('monthly').get();
        res.json(leaderboardDoc.exists ? leaderboardDoc.data() : { entries: [] });
      }
    } catch (error: any) {
      console.error('Leaderboard fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Token Balance - GET /api/tokens/balance
  app.get("/api/tokens/balance", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { address } = req.query;

      if (!address || typeof address !== 'string') {
        res.status(400).json({ error: 'Address parameter required' });
        return;
      }

      const balance = await getTokenBalance(address);
      res.json({
        address,
        balance,
        symbol: 'ECO',
        decimals: 18
      });
    } catch (error: any) {
      console.error('Balance fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });

  // Mint Tokens - POST /api/tokens/mint
  app.post("/api/tokens/mint", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { address, amount, metadata } = req.body;

      if (!address || !amount) {
        res.status(400).json({ error: 'Address and amount required' });
        return;
      }

      // Check if minting is enabled
      const backendAllowMint = process.env.BACKEND_ALLOW_MINT === 'true';
      if (!backendAllowMint && !isMockMode()) {
        res.status(403).json({ error: 'Minting not enabled' });
        return;
      }

      const result = await mintTokens(address, amount, {
        ...metadata,
        userId: req.user?.uid || 'unknown',
        requestedBy: req.user?.email || 'unknown'
      });

      res.json({
        success: result.success,
        txHash: result.txHash,
        amount,
        address
      });
    } catch (error: any) {
      console.error('Mint error:', error);
      res.status(500).json({ error: 'Minting failed' });
    }
  });

  // Burn Tokens - POST /api/tokens/burn
  app.post("/api/tokens/burn", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { address, amount } = req.body;

      if (!address || !amount) {
        res.status(400).json({ error: 'Address and amount required' });
        return;
      }

      const result = await burnTokens(address, amount, {
        userId: req.user?.uid || 'unknown',
        requestedBy: req.user?.email || 'unknown'
      });

      res.json({
        success: result.success,
        txHash: result.txHash,
        amount,
        address
      });
    } catch (error: any) {
      console.error('Burn error:', error);
      res.status(500).json({ error: 'Burning failed' });
    }
  });

  // Transactions - GET /api/transactions/:userId
  app.get("/api/transactions/:userId", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Users can only access their own transactions
      if (userId !== req.user?.uid) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (isMockMode()) {
        // Mock transaction data
        const mockTransactions = [
          {
            txId: 'tx1',
            uid: userId,
            type: 'mint',
            amount: 15,
            tokenSymbol: 'ECO',
            txHash: 'mock_tx_123456',
            createdAt: new Date('2024-01-20').toISOString(),
            metadata: { reason: 'Energy savings verified' }
          },
          {
            txId: 'tx2',
            uid: userId,
            type: 'mint',
            amount: 8,
            tokenSymbol: 'ECO',
            txHash: 'mock_tx_789012',
            createdAt: new Date('2024-01-18').toISOString(),
            metadata: { reason: 'Solar panel installation' }
          }
        ];
        res.json(mockTransactions);
      } else {
        const firestore = getFirestore();
        const transactionsSnapshot = await firestore
          .collection('transactions')
          .where('uid', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        const transactions = transactionsSnapshot.docs.map(doc => doc.data());
        res.json(transactions);
      }
    } catch (error: any) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Chat with Assistant - POST /api/chat
  app.post("/api/chat", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message } = req.body;
      const userId = req.user?.uid || 'unknown';

      if (!message) {
        res.status(400).json({ error: 'Message required' });
        return;
      }

      const response = await chatWithAssistant(userId, message);
      res.json(response);
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Chat failed' });
    }
  });

  // File Upload for Carbon Calculation - POST /api/upload
  app.post("/api/upload", verifyFirebaseToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const userId = req.user?.uid || 'unknown';

      // Validate file for carbon calculation
      const validation = validateCarbonFile(req.file);
      if (!validation.valid) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: validation.message });
        return;
      }

      // Process the uploaded file
      const processedFile = await processUploadedFile(req.file, userId);

      res.json({
        success: true,
        file: processedFile,
        message: 'File uploaded successfully'
      });

    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'File upload failed' });
    }
  });

  // Advanced Carbon Calculation - POST /api/calculate-carbon
  app.post("/api/calculate-carbon", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { energyData } = req.body;

      if (!energyData || !energyData.kWh) {
        res.status(400).json({ error: 'Energy data with kWh required' });
        return;
      }

      // Use ML service for calculation
      const mlResult = await calculateCarbonWithML({
        kWh: energyData.kWh,
        type: energyData.type || 'electricity_grid',
        household_size: energyData.household_size || 2
      });

      res.json({
        success: true,
        result: mlResult,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Carbon calculation error:', error);
      res.status(500).json({ error: 'Carbon calculation failed' });
    }
  });

  // Serve uploaded files - GET /uploads/:filename
  app.get("/uploads/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error('File serving error:', error);
      res.status(500).json({ error: 'File serving failed' });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        firebase: !isMockMode(),
        blockchain: !isBlockchainMockMode(),
        ai: !isAIMockMode()
      }
    });
  });

  // Legacy routes for compatibility
  app.post("/api/auth/register", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

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
