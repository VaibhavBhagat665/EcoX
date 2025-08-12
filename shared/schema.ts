import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Updated with missing fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"), // Added name field
  displayName: text("display_name"),
  avatar: text("avatar"), // Added avatar field
  photoURL: text("photo_url"),
  firebaseUID: text("firebase_uid").unique(),
  firebaseUid: text("firebase_uid_alt").unique(), // Added alternative field name used in routes
  carbonFootprint: decimal("carbon_footprint", { precision: 10, scale: 2 }).default('0'),
  energyUsage: decimal("energy_usage", { precision: 10, scale: 2 }).default('0'),
  ecoScore: integer("eco_score").default(100),
  ecoTokenBalance: decimal("eco_token_balance", { precision: 10, scale: 8 }).default('0.00000000'), // Added token balance
  totalActionsCompleted: integer("total_actions_completed").default(0), // Added actions count
  challenges: jsonb("challenges").$type<string[]>().default([]),
  achievements: jsonb("achievements").$type<string[]>().default([]),
  preferences: jsonb("preferences").$type<{
    notifications: boolean;
    publicProfile: boolean;
    dataSharing: boolean;
  }>().default({ notifications: true, publicProfile: true, dataSharing: false }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  firebaseUidIdx: index("users_firebase_uid_idx").on(table.firebaseUID),
  firebaseUidAltIdx: index("users_firebase_uid_alt_idx").on(table.firebaseUid),
}));

// Green actions table - NEW
export const greenActions = pgTable("green_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category", { 
    enum: ['energy', 'waste', 'transportation', 'consumption', 'water'] 
  }).notNull(),
  description: text("description"),
  tokensEarned: decimal("tokens_earned", { precision: 10, scale: 8 }).notNull(),
  proofImages: jsonb("proof_images").$type<string[]>().default([]),
  status: text("status", { enum: ['pending', 'verified', 'rejected'] }).default('pending'),
  verificationData: jsonb("verification_data").$type<{
    verified: boolean;
    confidence: number;
    aiAnalysis: string;
    feedback?: string;
  }>(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("green_actions_user_id_idx").on(table.userId),
  statusIdx: index("green_actions_status_idx").on(table.status),
  categoryIdx: index("green_actions_category_idx").on(table.category),
  createdAtIdx: index("green_actions_created_at_idx").on(table.createdAt),
}));

// Eco token transactions table - NEW
export const ecoTokenTransactions = pgTable("eco_token_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actionId: varchar("action_id").references(() => greenActions.id, { onDelete: "set null" }),
  type: text("type", { enum: ['mint', 'burn', 'transfer'] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 8 }).notNull(),
  status: text("status", { enum: ['pending', 'confirmed', 'failed'] }).default('pending'),
  blockchainTxHash: text("blockchain_tx_hash"),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  metadata: jsonb("metadata").$type<{
    reason?: string;
    description?: string;
    gas?: number;
    gasPrice?: string;
  }>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("eco_token_transactions_user_id_idx").on(table.userId),
  statusIdx: index("eco_token_transactions_status_idx").on(table.status),
  typeIdx: index("eco_token_transactions_type_idx").on(table.type),
  createdAtIdx: index("eco_token_transactions_created_at_idx").on(table.createdAt),
}));

// Environmental metrics table
export const environmentalMetrics = pgTable("environmental_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  airQuality: text("air_quality"),
  airQualityIndex: integer("air_quality_index"),
  energyUsage: decimal("energy_usage", { precision: 10, scale: 2 }),
  carbonFootprint: decimal("carbon_footprint", { precision: 10, scale: 2 }),
  location: jsonb("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  }>(),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("env_metrics_user_id_idx").on(table.userId),
  timestampIdx: index("env_metrics_timestamp_idx").on(table.timestamp),
}));

// AI recommendations table
export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  impact: text("impact", { enum: ['high', 'medium', 'low'] }).notNull(),
  category: text("category", { enum: ['energy', 'waste', 'transportation', 'consumption', 'water'] }).notNull(),
  priority: integer("priority").default(1),
  actionable: boolean("actionable").default(true),
  estimatedSavings: jsonb("estimated_savings").$type<{
    carbon: number;
    energy: number;
    water: number;
    cost: number;
  }>(),
  implementation: jsonb("implementation").$type<{
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: string;
    resources: string[];
  }>(),
  status: text("status", { enum: ['active', 'completed', 'dismissed'] }).default('active'),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("ai_recs_user_id_idx").on(table.userId),
  statusIdx: index("ai_recs_status_idx").on(table.status),
  categoryIdx: index("ai_recs_category_idx").on(table.category),
}));

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<{
    confidence?: number;
    sources?: string[];
    recommendations?: string[];
  }>(),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("chat_messages_user_id_idx").on(table.userId),
  timestampIdx: index("chat_messages_timestamp_idx").on(table.timestamp),
}));

// Challenges table
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ['individual', 'team', 'global'] }).notNull(),
  category: text("category", { enum: ['energy', 'waste', 'transportation', 'consumption', 'water', 'general'] }).notNull(),
  difficulty: text("difficulty", { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
  duration: jsonb("duration").$type<{
    start: Date;
    end: Date;
    durationDays: number;
  }>().notNull(),
  status: text("status", { enum: ['upcoming', 'active', 'completed', 'cancelled'] }).default('upcoming'),
  participants: jsonb("participants").$type<{
    current: number;
    maximum?: number;
    target?: number;
  }>().default({ current: 0 }),
  rewards: jsonb("rewards").$type<{
    points: number;
    badges: string[];
    achievements: string[];
  }>(),
  goals: jsonb("goals").$type<{
    target: number;
    unit: string;
    description: string;
  }>().notNull(),
  rules: jsonb("rules").$type<string[]>().default([]),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  statusIdx: index("challenges_status_idx").on(table.status),
  categoryIdx: index("challenges_category_idx").on(table.category),
  createdByIdx: index("challenges_created_by_idx").on(table.createdBy),
}));

// Challenge participation table
export const challengeParticipation = pgTable("challenge_participation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  status: text("status", { enum: ['active', 'completed', 'dropped'] }).default('active'),
  progress: jsonb("progress").$type<{
    current: number;
    percentage: number;
    milestones: {
      name: string;
      target: number;
      completed: boolean;
      completedAt?: Date;
    }[];
  }>(),
  submissions: jsonb("submissions").$type<{
    id: string;
    data: any;
    timestamp: Date;
    verified: boolean;
  }[]>().default([]),
}, (table) => ({
  userIdIdx: index("challenge_part_user_id_idx").on(table.userId),
  challengeIdIdx: index("challenge_part_challenge_id_idx").on(table.challengeId),
  statusIdx: index("challenge_part_status_idx").on(table.status),
}));

// Leaderboard table
export const leaderboard = pgTable("leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  points: integer("points").default(0),
  level: integer("level").default(1),
  achievements: jsonb("achievements").$type<string[]>().default([]),
  badges: jsonb("badges").$type<string[]>().default([]),
  streaks: jsonb("streaks").$type<{
    current: number;
    longest: number;
  }>().default({ current: 0, longest: 0 }),
  stats: jsonb("stats").$type<{
    challengesCompleted: number;
    carbonSaved: number;
    energySaved: number;
  }>().default({ challengesCompleted: 0, carbonSaved: 0, energySaved: 0 }),
  period: text("period", { enum: ['daily', 'weekly', 'monthly', 'yearly', 'allTime'] }).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdIdx: index("leaderboard_user_id_idx").on(table.userId),
  rankIdx: index("leaderboard_rank_idx").on(table.rank),
  periodIdx: index("leaderboard_period_idx").on(table.period),
}));

// Social posts table
export const socialPosts = pgTable("social_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: text("type", { enum: ['achievement', 'tip', 'question', 'celebration', 'general'] }).default('general'),
  media: jsonb("media").$type<{
    type: 'image' | 'video';
    url: string;
    caption?: string;
  }[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  mentions: jsonb("mentions").$type<string[]>().default([]),
  engagement: jsonb("engagement").$type<{
    likes: number;
    comments: number;
    shares: number;
    reactions: Record<string, number>;
  }>().default({ likes: 0, comments: 0, shares: 0, reactions: {} }),
  visibility: text("visibility", { enum: ['public', 'friends', 'private'] }).default('public'),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
  editedAt: timestamp("edited_at"),
}, (table) => ({
  authorIdIdx: index("social_posts_author_id_idx").on(table.authorId),
  timestampIdx: index("social_posts_timestamp_idx").on(table.timestamp),
  typeIdx: index("social_posts_type_idx").on(table.type),
  visibilityIdx: index("social_posts_visibility_idx").on(table.visibility),
}));

// Builder.io content table
export const builderContent = pgTable("builder_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  published: text("published", { enum: ['published', 'draft', 'archived'] }).default('draft'),
  data: jsonb("data").$type<{
    title?: string;
    description?: string;
    content?: any;
    settings?: Record<string, any>;
    seo?: {
      title: string;
      description: string;
      keywords: string[];
    };
  }>(),
  createdBy: varchar("created_by").notNull(),
  createdDate: timestamp("created_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastUpdateBy: varchar("last_update_by").notNull(),
  lastUpdated: timestamp("last_updated").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  nameIdx: index("builder_content_name_idx").on(table.name),
  publishedIdx: index("builder_content_published_idx").on(table.published),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGreenActionSchema = createInsertSchema(greenActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEcoTokenTransactionSchema = createInsertSchema(ecoTokenTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnvironmentalMetricsSchema = createInsertSchema(environmentalMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChallengeParticipationSchema = createInsertSchema(challengeParticipation).omit({
  id: true,
  joinedAt: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  timestamp: true,
  editedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GreenAction = typeof greenActions.$inferSelect;
export type InsertGreenAction = z.infer<typeof insertGreenActionSchema>;

export type EcoTokenTransaction = typeof ecoTokenTransactions.$inferSelect;
export type InsertEcoTokenTransaction = z.infer<typeof insertEcoTokenTransactionSchema>;

export type EnvironmentalMetrics = typeof environmentalMetrics.$inferSelect;
export type InsertEnvironmentalMetrics = z.infer<typeof insertEnvironmentalMetricsSchema>;

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipation = typeof challengeParticipation.$inferSelect;
export type InsertChallengeParticipation = z.infer<typeof insertChallengeParticipationSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;

export type BuilderContent = typeof builderContent.$inferSelect;