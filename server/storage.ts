import { randomUUID } from "crypto";
import { 
  type User, 
  type InsertUser,
  type EnvironmentalMetrics,
  type InsertEnvironmentalMetrics,
  type AiRecommendation,
  type InsertAiRecommendation,
  type ChatMessage,
  type InsertChatMessage,
  type Challenge,
  type InsertChallenge,
  type ChallengeParticipation,
  type InsertChallengeParticipation,
  type LeaderboardEntry,
  type SocialPost,
  type InsertSocialPost
} from "@shared/schema";

// Storage interface for EcoX application
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  // Environmental metrics operations
  getEnvironmentalMetrics(userId: string, limit?: number): Promise<EnvironmentalMetrics[]>;
  getLatestMetrics(userId: string): Promise<EnvironmentalMetrics | undefined>;
  createEnvironmentalMetrics(metrics: InsertEnvironmentalMetrics): Promise<EnvironmentalMetrics>;
  getMetricsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EnvironmentalMetrics[]>;

  // AI recommendations operations
  getRecommendations(userId: string, status?: string): Promise<AiRecommendation[]>;
  createRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  updateRecommendation(id: string, updates: Partial<AiRecommendation>): Promise<AiRecommendation>;
  deleteRecommendation(id: string): Promise<boolean>;

  // Chat messages operations
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatHistory(userId: string): Promise<boolean>;

  // Challenge operations
  getChallenges(status?: string, category?: string): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge>;
  deleteChallenge(id: string): Promise<boolean>;

  // Challenge participation operations
  getChallengeParticipation(userId: string, challengeId?: string): Promise<ChallengeParticipation[]>;
  createChallengeParticipation(participation: InsertChallengeParticipation): Promise<ChallengeParticipation>;
  updateChallengeParticipation(id: string, updates: Partial<ChallengeParticipation>): Promise<ChallengeParticipation>;
  leaveChallengeParticipation(userId: string, challengeId: string): Promise<boolean>;

  // Leaderboard operations
  getLeaderboard(period: string, limit?: number): Promise<LeaderboardEntry[]>;
  getUserLeaderboardEntry(userId: string, period: string): Promise<LeaderboardEntry | undefined>;
  updateLeaderboardEntry(userId: string, period: string, updates: Partial<LeaderboardEntry>): Promise<LeaderboardEntry>;

  // Social posts operations
  getSocialPosts(limit?: number, visibility?: string): Promise<SocialPost[]>;
  getUserPosts(userId: string, limit?: number): Promise<SocialPost[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<SocialPost>;
  deleteSocialPost(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private environmentalMetrics: Map<string, EnvironmentalMetrics>;
  private aiRecommendations: Map<string, AiRecommendation>;
  private chatMessages: Map<string, ChatMessage>;
  private challenges: Map<string, Challenge>;
  private challengeParticipation: Map<string, ChallengeParticipation>;
  private leaderboard: Map<string, LeaderboardEntry>;
  private socialPosts: Map<string, SocialPost>;

  constructor() {
    this.users = new Map();
    this.environmentalMetrics = new Map();
    this.aiRecommendations = new Map();
    this.chatMessages = new Map();
    this.challenges = new Map();
    this.challengeParticipation = new Map();
    this.leaderboard = new Map();
    this.socialPosts = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample challenges
    const sampleChallenges: Challenge[] = [
      {
        id: randomUUID(),
        name: "Zero Waste Week",
        description: "Reduce waste to zero for 7 consecutive days",
        type: "individual",
        category: "waste",
        difficulty: "intermediate",
        duration: {
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          durationDays: 7
        },
        status: "active",
        participants: { current: 1247, target: 2000 },
        rewards: {
          points: 500,
          badges: ["waste-warrior"],
          achievements: ["zero-waste-champion"]
        },
        goals: {
          target: 0,
          unit: "kg",
          description: "Produce zero waste for 7 days"
        },
        rules: [
          "Track all waste produced",
          "Document reduction strategies",
          "Share daily progress"
        ],
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Energy Saver Month",
        description: "Reduce energy consumption by 20% this month",
        type: "global",
        category: "energy",
        difficulty: "beginner",
        duration: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          durationDays: 30
        },
        status: "active",
        participants: { current: 892, target: 1500 },
        rewards: {
          points: 300,
          badges: ["energy-saver"],
          achievements: ["efficient-home"]
        },
        goals: {
          target: 20,
          unit: "%",
          description: "Reduce energy consumption by 20%"
        },
        rules: [
          "Monitor daily energy usage",
          "Implement energy-saving measures",
          "Report weekly progress"
        ],
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleChallenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUID === firebaseUID);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      challenges: insertUser.challenges || [],
      achievements: insertUser.achievements || [],
      preferences: insertUser.preferences || {
        notifications: true,
        publicProfile: true,
        dataSharing: false
      },
      carbonFootprint: insertUser.carbonFootprint || '0',
      energyUsage: insertUser.energyUsage || '0',
      ecoScore: insertUser.ecoScore || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Environmental metrics operations
  async getEnvironmentalMetrics(userId: string, limit = 50): Promise<EnvironmentalMetrics[]> {
    const userMetrics = Array.from(this.environmentalMetrics.values())
      .filter(metric => metric.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return userMetrics;
  }

  async getLatestMetrics(userId: string): Promise<EnvironmentalMetrics | undefined> {
    const metrics = await this.getEnvironmentalMetrics(userId, 1);
    return metrics[0];
  }

  async createEnvironmentalMetrics(insertMetrics: InsertEnvironmentalMetrics): Promise<EnvironmentalMetrics> {
    const id = randomUUID();
    const metrics: EnvironmentalMetrics = {
      ...insertMetrics,
      id,
      timestamp: new Date(),
    };
    this.environmentalMetrics.set(id, metrics);
    return metrics;
  }

  async getMetricsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EnvironmentalMetrics[]> {
    return Array.from(this.environmentalMetrics.values())
      .filter(metric => 
        metric.userId === userId && 
        metric.timestamp >= startDate && 
        metric.timestamp <= endDate
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // AI recommendations operations
  async getRecommendations(userId: string, status?: string): Promise<AiRecommendation[]> {
    const userRecommendations = Array.from(this.aiRecommendations.values())
      .filter(rec => rec.userId === userId && (!status || rec.status === status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return userRecommendations;
  }

  async createRecommendation(insertRecommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const id = randomUUID();
    const recommendation: AiRecommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.aiRecommendations.set(id, recommendation);
    return recommendation;
  }

  async updateRecommendation(id: string, updates: Partial<AiRecommendation>): Promise<AiRecommendation> {
    const recommendation = this.aiRecommendations.get(id);
    if (!recommendation) throw new Error("Recommendation not found");
    
    const updatedRecommendation = { ...recommendation, ...updates, updatedAt: new Date() };
    this.aiRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  async deleteRecommendation(id: string): Promise<boolean> {
    return this.aiRecommendations.delete(id);
  }

  // Chat messages operations
  async getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    const userMessages = Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
    return userMessages;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async deleteChatHistory(userId: string): Promise<boolean> {
    const userMessageIds = Array.from(this.chatMessages.entries())
      .filter(([_, msg]) => msg.userId === userId)
      .map(([id, _]) => id);
    
    userMessageIds.forEach(id => this.chatMessages.delete(id));
    return true;
  }

  // Challenge operations
  async getChallenges(status?: string, category?: string): Promise<Challenge[]> {
    let challenges = Array.from(this.challenges.values());
    
    if (status) {
      challenges = challenges.filter(challenge => challenge.status === status);
    }
    
    if (category) {
      challenges = challenges.filter(challenge => challenge.category === category);
    }
    
    return challenges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = randomUUID();
    const challenge: Challenge = {
      ...insertChallenge,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) throw new Error("Challenge not found");
    
    const updatedChallenge = { ...challenge, ...updates, updatedAt: new Date() };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async deleteChallenge(id: string): Promise<boolean> {
    return this.challenges.delete(id);
  }

  // Challenge participation operations
  async getChallengeParticipation(userId: string, challengeId?: string): Promise<ChallengeParticipation[]> {
    let participations = Array.from(this.challengeParticipation.values())
      .filter(participation => participation.userId === userId);
    
    if (challengeId) {
      participations = participations.filter(participation => participation.challengeId === challengeId);
    }
    
    return participations.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());
  }

  async createChallengeParticipation(insertParticipation: InsertChallengeParticipation): Promise<ChallengeParticipation> {
    const id = randomUUID();
    const participation: ChallengeParticipation = {
      ...insertParticipation,
      id,
      joinedAt: new Date(),
    };
    this.challengeParticipation.set(id, participation);
    return participation;
  }

  async updateChallengeParticipation(id: string, updates: Partial<ChallengeParticipation>): Promise<ChallengeParticipation> {
    const participation = this.challengeParticipation.get(id);
    if (!participation) throw new Error("Challenge participation not found");
    
    const updatedParticipation = { ...participation, ...updates };
    this.challengeParticipation.set(id, updatedParticipation);
    return updatedParticipation;
  }

  async leaveChallengeParticipation(userId: string, challengeId: string): Promise<boolean> {
    const participationId = Array.from(this.challengeParticipation.entries())
      .find(([_, participation]) => participation.userId === userId && participation.challengeId === challengeId)?.[0];
    
    if (participationId) {
      return this.challengeParticipation.delete(participationId);
    }
    
    return false;
  }

  // Leaderboard operations
  async getLeaderboard(period: string, limit = 50): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboard.values())
      .filter(entry => entry.period === period)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }

  async getUserLeaderboardEntry(userId: string, period: string): Promise<LeaderboardEntry | undefined> {
    return Array.from(this.leaderboard.values())
      .find(entry => entry.userId === userId && entry.period === period);
  }

  async updateLeaderboardEntry(userId: string, period: string, updates: Partial<LeaderboardEntry>): Promise<LeaderboardEntry> {
    const existingEntry = await this.getUserLeaderboardEntry(userId, period);
    
    if (existingEntry) {
      const updatedEntry = { ...existingEntry, ...updates, updatedAt: new Date() };
      this.leaderboard.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    } else {
      const id = randomUUID();
      const newEntry: LeaderboardEntry = {
        id,
        userId,
        period,
        rank: 999,
        points: 0,
        level: 1,
        achievements: [],
        badges: [],
        streaks: { current: 0, longest: 0 },
        stats: { challengesCompleted: 0, carbonSaved: 0, energySaved: 0 },
        updatedAt: new Date(),
        ...updates,
      };
      this.leaderboard.set(id, newEntry);
      return newEntry;
    }
  }

  // Social posts operations
  async getSocialPosts(limit = 50, visibility = "public"): Promise<SocialPost[]> {
    return Array.from(this.socialPosts.values())
      .filter(post => post.visibility === visibility)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getUserPosts(userId: string, limit = 50): Promise<SocialPost[]> {
    return Array.from(this.socialPosts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createSocialPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const id = randomUUID();
    const post: SocialPost = {
      ...insertPost,
      id,
      timestamp: new Date(),
    };
    this.socialPosts.set(id, post);
    return post;
  }

  async updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<SocialPost> {
    const post = this.socialPosts.get(id);
    if (!post) throw new Error("Social post not found");
    
    const updatedPost = { ...post, ...updates, editedAt: new Date() };
    this.socialPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteSocialPost(id: string): Promise<boolean> {
    return this.socialPosts.delete(id);
  }
}

export const storage = new MemStorage();
