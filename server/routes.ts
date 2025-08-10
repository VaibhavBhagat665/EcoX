import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertEnvironmentalMetricsSchema,
  insertAiRecommendationSchema,
  insertChatMessageSchema,
  insertChallengeSchema,
  insertChallengeParticipationSchema,
  insertSocialPostSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Environmental metrics routes
  app.get("/api/environmental/metrics", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const metrics = await storage.getEnvironmentalMetrics(userId, limit);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/environmental/metrics", async (req, res) => {
    try {
      const metricsData = insertEnvironmentalMetricsSchema.parse(req.body);
      const metrics = await storage.createEnvironmentalMetrics(metricsData);
      res.status(201).json(metrics);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/environmental/metrics/latest", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const metrics = await storage.getLatestMetrics(userId);
      if (!metrics) {
        return res.status(404).json({ error: "No metrics found" });
      }
      
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI recommendations routes
  app.get("/api/ai/recommendations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const status = req.query.status as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const recommendations = await storage.getRecommendations(userId, status);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const recommendationData = insertAiRecommendationSchema.parse(req.body);
      const recommendation = await storage.createRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/ai/recommendations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const recommendation = await storage.updateRecommendation(req.params.id, updates);
      res.json(recommendation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Chat routes (AI chat integration would go here)
  app.get("/api/ai/chat", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Challenges routes
  app.get("/api/community/challenges", async (req, res) => {
    try {
      const status = req.query.status as string;
      const category = req.query.category as string;
      
      const challenges = await storage.getChallenges(status, category);
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/community/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/community/challenges", async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Challenge participation routes
  app.get("/api/community/participation", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const challengeId = req.query.challengeId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const participation = await storage.getChallengeParticipation(userId, challengeId);
      res.json(participation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/community/participation", async (req, res) => {
    try {
      const participationData = insertChallengeParticipationSchema.parse(req.body);
      const participation = await storage.createChallengeParticipation(participationData);
      res.status(201).json(participation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Leaderboard routes
  app.get("/api/community/leaderboard", async (req, res) => {
    try {
      const period = req.query.period as string || 'allTime';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const leaderboard = await storage.getLeaderboard(period, limit);
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/community/leaderboard/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const period = req.query.period as string || 'allTime';
      
      const entry = await storage.getUserLeaderboardEntry(userId, period);
      if (!entry) {
        return res.status(404).json({ error: "Leaderboard entry not found" });
      }
      
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Social feed routes
  app.get("/api/community/feed", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const visibility = req.query.visibility as string;
      
      const posts = await storage.getSocialPosts(limit, visibility);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/community/feed/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const posts = await storage.getUserPosts(userId, limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/community/feed", async (req, res) => {
    try {
      const postData = insertSocialPostSchema.parse(req.body);
      const post = await storage.createSocialPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/community/feed/:id", async (req, res) => {
    try {
      const updates = req.body;
      const post = await storage.updateSocialPost(req.params.id, updates);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // AI insights endpoint (placeholder for integration with Vercel AI SDK)
  app.post("/api/ai/insights", async (req, res) => {
    try {
      // This would integrate with Vercel AI SDK and Gemini API
      const { data, context } = req.body;
      
      // Mock response for now - in production this would use actual AI processing
      const insights = {
        insights: [
          "Your energy usage has decreased by 15% this month",
          "Consider switching to renewable energy sources",
          "Your carbon footprint is 20% below average"
        ],
        predictions: {
          nextMonthEnergy: "8% reduction expected",
          carbonGoals: "On track to meet 2024 targets"
        },
        recommendations: [
          {
            title: "Smart Thermostat Optimization",
            description: "Adjust heating schedule for optimal efficiency",
            impact: "high",
            savings: { carbon: 25.5, energy: 120, cost: 45 }
          }
        ]
      };
      
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date(),
      version: "1.0.0",
      services: {
        database: "connected",
        ai: "available",
        storage: "ready"
      }
    });
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
