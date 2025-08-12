import { 
  type User, 
  type InsertUser, 
  type GreenAction, 
  type InsertGreenAction,
  type EcoTokenTransaction,
  type InsertEcoTokenTransaction,
  type AdminUser,
  type InsertAdminUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{ total: number; growth: number }>;

  // Admin operations
  getAdminByFirebaseUid(firebaseUid: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;

  // Green actions operations
  getGreenAction(id: string): Promise<GreenAction | undefined>;
  createGreenAction(action: InsertGreenAction): Promise<GreenAction>;
  updateGreenAction(id: string, updates: Partial<GreenAction>): Promise<GreenAction | undefined>;
  getGreenActionsByUser(userId: string): Promise<GreenAction[]>;
  getAllGreenActions(): Promise<GreenAction[]>;
  getRecentGreenActions(limit?: number): Promise<GreenAction[]>;
  getGreenActionsStats(): Promise<{ total: number; growth: number; byCategory: Record<string, number> }>;

  // Token transaction operations
  createTokenTransaction(transaction: InsertEcoTokenTransaction): Promise<EcoTokenTransaction>;
  getTokenTransactionsByUser(userId: string): Promise<EcoTokenTransaction[]>;
  updateTokenTransaction(id: string, updates: Partial<EcoTokenTransaction>): Promise<EcoTokenTransaction | undefined>;
  getTokenStats(): Promise<{ totalMinted: string; growth: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private admins: Map<string, AdminUser>;
  private greenActions: Map<string, GreenAction>;
  private tokenTransactions: Map<string, EcoTokenTransaction>;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.greenActions = new Map();
    this.tokenTransactions = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Create a default admin user
    const adminId = randomUUID();
    const admin: AdminUser = {
      id: adminId,
      firebaseUid: 'admin-firebase-uid',
      email: 'admin@ecox.com',
      name: 'John Admin',
      role: 'admin',
      createdAt: new Date(),
    };
    this.admins.set(adminId, admin);

    // Create some sample users
    const users = [
      {
        id: randomUUID(),
        firebaseUid: 'user1-firebase-uid',
        email: 'sarah.chen@email.com',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32',
        ecoTokenBalance: '45.25000000',
        totalActionsCompleted: 12,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        firebaseUid: 'user2-firebase-uid', 
        email: 'marcus.j@email.com',
        name: 'Marcus Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32',
        ecoTokenBalance: '78.50000000',
        totalActionsCompleted: 8,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        firebaseUid: 'user3-firebase-uid',
        email: 'emma.r@email.com', 
        name: 'Emma Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32',
        ecoTokenBalance: '234.75000000',
        totalActionsCompleted: 25,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }
    ];

    users.forEach(user => this.users.set(user.id, user as User));

    // Create sample green actions
    const userArray = Array.from(this.users.values());
    const actions = [
      {
        id: randomUUID(),
        userId: userArray[0].id,
        title: 'Recycled 5kg of plastic',
        description: 'Properly sorted and recycled plastic waste',
        category: 'recycling',
        tokensEarned: '25.00000000',
        status: 'verified',
        verificationData: { confidence: 0.95, aiScore: 0.92 },
        verifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        verifiedBy: 'AI',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: userArray[1].id,
        title: 'Bike to work for 1 week',
        description: 'Used bicycle instead of car for daily commute',
        category: 'transportation',
        tokensEarned: '50.00000000',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: userArray[2].id,
        title: 'Solar panel installation',
        description: 'Installed 5kW solar panel system',
        category: 'energy',
        tokensEarned: '200.00000000',
        status: 'verified',
        verificationData: { confidence: 0.98, aiScore: 0.96 },
        verifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        verifiedBy: 'AI',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }
    ];

    actions.forEach(action => this.greenActions.set(action.id, action as GreenAction));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      avatar: insertUser.avatar || null,
      ecoTokenBalance: '0',
      totalActionsCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserStats(): Promise<{ total: number; growth: number }> {
    const total = this.users.size;
    const growth = 12.5; // Mock growth percentage
    return { total, growth };
  }

  // Admin operations
  async getAdminByFirebaseUid(firebaseUid: string): Promise<AdminUser | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.firebaseUid === firebaseUid);
  }

  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      role: insertAdmin.role || 'admin',
      createdAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }

  // Green actions operations
  async getGreenAction(id: string): Promise<GreenAction | undefined> {
    return this.greenActions.get(id);
  }

  async createGreenAction(insertAction: InsertGreenAction): Promise<GreenAction> {
    const id = randomUUID();
    const action: GreenAction = {
      ...insertAction,
      id,
      verifiedAt: null,
      verifiedBy: null,
      createdAt: new Date(),
    };
    this.greenActions.set(id, action);
    return action;
  }

  async updateGreenAction(id: string, updates: Partial<GreenAction>): Promise<GreenAction | undefined> {
    const action = this.greenActions.get(id);
    if (!action) return undefined;

    const updatedAction = { ...action, ...updates };
    this.greenActions.set(id, updatedAction);
    return updatedAction;
  }

  async getGreenActionsByUser(userId: string): Promise<GreenAction[]> {
    return Array.from(this.greenActions.values()).filter(action => action.userId === userId);
  }

  async getAllGreenActions(): Promise<GreenAction[]> {
    return Array.from(this.greenActions.values());
  }

  async getRecentGreenActions(limit: number = 10): Promise<GreenAction[]> {
    return Array.from(this.greenActions.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getGreenActionsStats(): Promise<{ total: number; growth: number; byCategory: Record<string, number> }> {
    const actions = Array.from(this.greenActions.values());
    const total = actions.length;
    const growth = 23.1; // Mock growth percentage

    const byCategory = actions.reduce((acc, action) => {
      acc[action.category] = (acc[action.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, growth, byCategory };
  }

  // Token transaction operations
  async createTokenTransaction(insertTransaction: InsertEcoTokenTransaction): Promise<EcoTokenTransaction> {
    const id = randomUUID();
    const transaction: EcoTokenTransaction = {
      ...insertTransaction,
      id,
      status: insertTransaction.status || 'pending',
      createdAt: new Date(),
    };
    this.tokenTransactions.set(id, transaction);
    return transaction;
  }

  async getTokenTransactionsByUser(userId: string): Promise<EcoTokenTransaction[]> {
    return Array.from(this.tokenTransactions.values()).filter(tx => tx.userId === userId);
  }

  async updateTokenTransaction(id: string, updates: Partial<EcoTokenTransaction>): Promise<EcoTokenTransaction | undefined> {
    const transaction = this.tokenTransactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, ...updates };
    this.tokenTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getTokenStats(): Promise<{ totalMinted: string; growth: number }> {
    const transactions = Array.from(this.tokenTransactions.values());
    const totalMinted = transactions
      .filter(tx => tx.type === 'mint')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    return {
      totalMinted: (totalMinted / 1000).toFixed(1) + 'K',
      growth: 8.7
    };
  }
}

export const storage = new MemStorage();
