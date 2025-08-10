// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  carbonFootprint: number;
  energyUsage: number;
  ecoScore: number;
  challenges: string[];
  achievements: string[];
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    dataSharing: boolean;
  };
}

// Environmental data types
export interface EnvironmentalMetrics {
  id: string;
  userId: string;
  temperature: number;
  humidity: number;
  airQuality: string;
  airQualityIndex: number;
  energyUsage: number;
  carbonFootprint: number;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
}

// AI types
export interface AIRecommendation {
  id: string;
  userId: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'energy' | 'waste' | 'transportation' | 'consumption' | 'water';
  priority: number;
  actionable: boolean;
  estimatedSavings?: {
    carbon: number; // kg CO2
    energy: number; // kWh
    water: number; // liters
    cost: number; // USD
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: string;
    resources: string[];
  };
  status: 'active' | 'completed' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    recommendations?: string[];
  };
}

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  action?: string;
  parameters?: Record<string, any>;
  timestamp: Date;
}

// Community types
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'team' | 'global';
  category: 'energy' | 'waste' | 'transportation' | 'consumption' | 'water' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    start: Date;
    end: Date;
    durationDays: number;
  };
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participants: {
    current: number;
    maximum?: number;
    target?: number;
  };
  rewards: {
    points: number;
    badges: string[];
    achievements: string[];
  };
  goals: {
    target: number;
    unit: string;
    description: string;
  };
  rules: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  status: 'active' | 'completed' | 'dropped';
  progress: {
    current: number;
    percentage: number;
    milestones: {
      name: string;
      target: number;
      completed: boolean;
      completedAt?: Date;
    }[];
  };
  submissions: {
    id: string;
    data: any;
    timestamp: Date;
    verified: boolean;
  }[];
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  points: number;
  level: number;
  achievements: string[];
  badges: string[];
  streaks: {
    current: number;
    longest: number;
  };
  stats: {
    challengesCompleted: number;
    carbonSaved: number;
    energySaved: number;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime';
}

export interface SocialPost {
  id: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
    level: number;
    badges: string[];
  };
  content: string;
  type: 'achievement' | 'tip' | 'question' | 'celebration' | 'general';
  media?: {
    type: 'image' | 'video';
    url: string;
    caption?: string;
  }[];
  tags: string[];
  mentions: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    reactions: Record<string, number>;
  };
  visibility: 'public' | 'friends' | 'private';
  timestamp: Date;
  editedAt?: Date;
}

// Builder.io types
export interface BuilderContent {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  data: {
    title?: string;
    description?: string;
    content?: any;
    settings?: Record<string, any>;
    seo?: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
  createdBy: string;
  createdDate: Date;
  lastUpdateBy: string;
  lastUpdated: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
