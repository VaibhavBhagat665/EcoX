/**
 * Comprehensive Database Service for EcoX
 * Supports both Firestore and PostgreSQL with automatic fallback
 */

import { getFirestore, MockFirestore, isMockMode } from './firebase';
import { Pool } from 'pg';

// PostgreSQL connection
const pgPool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  walletAddress?: string;
  totalTokens: number;
  carbonSavedKg: number;
  joinedAt: Date;
  lastActionAt?: Date;
  preferences?: {
    notifications: boolean;
    publicProfile: boolean;
    language: string;
  };
  stats?: {
    actionsSubmitted: number;
    actionsVerified: number;
    streakDays: number;
  };
}

export interface Action {
  id: string;
  uid: string;
  type: 'energy' | 'transport' | 'solar' | 'waste' | 'water' | 'tree_planting';
  data: Record<string, any>;
  imageUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  tokensIssued: number;
  predictedCO2Kg: number;
  submitAt: Date;
  verifyAt?: Date;
  txHash?: string;
  aiAnalysis?: string;
  confidence?: number;
  mlResults?: {
    imageAnalysis?: any;
    carbonCalculation?: any;
    confidence: number;
  };
}

export interface Transaction {
  txId: string;
  uid: string;
  type: 'mint' | 'burn';
  amount: number;
  tokenSymbol: string;
  txHash: string;
  createdAt: Date;
  metadata?: Record<string, any>;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface UploadedFile {
  id: string;
  uid: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  processed: boolean;
  mlResults?: any;
}

class DatabaseService {
  private useFirestore: boolean;
  private usePG: boolean;

  constructor() {
    this.useFirestore = !isMockMode();
    this.usePG = !!pgPool;
    
    if (this.usePG) {
      this.initializePostgreSQL();
    }
    
    console.log(`📊 Database service initialized - Firestore: ${this.useFirestore}, PostgreSQL: ${this.usePG}`);
  }

  private async initializePostgreSQL() {
    if (!pgPool) return;

    try {
      // Create tables if they don't exist
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          uid VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          photo_url TEXT,
          wallet_address VARCHAR(42),
          total_tokens INTEGER DEFAULT 0,
          carbon_saved_kg DECIMAL(10,2) DEFAULT 0,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_action_at TIMESTAMP,
          preferences JSONB,
          stats JSONB
        );

        CREATE TABLE IF NOT EXISTS actions (
          id VARCHAR(255) PRIMARY KEY,
          uid VARCHAR(255) REFERENCES users(uid),
          type VARCHAR(50) NOT NULL,
          data JSONB NOT NULL,
          image_url TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          tokens_issued INTEGER DEFAULT 0,
          predicted_co2_kg DECIMAL(10,2) DEFAULT 0,
          submit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verify_at TIMESTAMP,
          tx_hash VARCHAR(66),
          ai_analysis TEXT,
          confidence DECIMAL(3,2),
          ml_results JSONB
        );

        CREATE TABLE IF NOT EXISTS transactions (
          tx_id VARCHAR(255) PRIMARY KEY,
          uid VARCHAR(255) REFERENCES users(uid),
          type VARCHAR(10) NOT NULL,
          amount INTEGER NOT NULL,
          token_symbol VARCHAR(10) DEFAULT 'ECO',
          tx_hash VARCHAR(66) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB,
          status VARCHAR(20) DEFAULT 'pending'
        );

        CREATE TABLE IF NOT EXISTS uploaded_files (
          id VARCHAR(255) PRIMARY KEY,
          uid VARCHAR(255) REFERENCES users(uid),
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          size_bytes INTEGER NOT NULL,
          url TEXT NOT NULL,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed BOOLEAN DEFAULT FALSE,
          ml_results JSONB
        );

        CREATE INDEX IF NOT EXISTS idx_actions_uid_status ON actions(uid, status);
        CREATE INDEX IF NOT EXISTS idx_transactions_uid ON transactions(uid);
        CREATE INDEX IF NOT EXISTS idx_files_uid ON uploaded_files(uid);
      `);
      
      console.log('✅ PostgreSQL tables initialized');
    } catch (error) {
      console.error('❌ PostgreSQL initialization failed:', error);
    }
  }

  // User Operations
  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      uid: userData.uid!,
      email: userData.email!,
      name: userData.name!,
      photoURL: userData.photoURL,
      walletAddress: userData.walletAddress,
      totalTokens: 0,
      carbonSavedKg: 0,
      joinedAt: new Date(),
      preferences: {
        notifications: true,
        publicProfile: true,
        language: 'en'
      },
      stats: {
        actionsSubmitted: 0,
        actionsVerified: 0,
        streakDays: 0
      }
    };

    // Store in both databases
    if (this.useFirestore) {
      const firestore = getFirestore();
      await firestore.collection('users').doc(user.uid).set(user);
    } else {
      await MockFirestore.collection('users').doc(user.uid).set(user);
    }

    if (this.usePG && pgPool) {
      await pgPool.query(`
        INSERT INTO users (uid, email, name, photo_url, wallet_address, total_tokens, carbon_saved_kg, preferences, stats)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (uid) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          photo_url = EXCLUDED.photo_url
      `, [
        user.uid, user.email, user.name, user.photoURL, user.walletAddress,
        user.totalTokens, user.carbonSavedKg, JSON.stringify(user.preferences), JSON.stringify(user.stats)
      ]);
    }

    return user;
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      if (this.useFirestore) {
        const firestore = getFirestore();
        const doc = await firestore.collection('users').doc(uid).get();
        return doc.exists ? doc.data() as User : null;
      } else {
        const doc = await MockFirestore.collection('users').doc(uid).get();
        return doc.exists ? doc.data() as User : null;
      }
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    if (this.useFirestore) {
      const firestore = getFirestore();
      await firestore.collection('users').doc(uid).update(updates);
    } else {
      await MockFirestore.collection('users').doc(uid).update(updates);
    }

    if (this.usePG && pgPool) {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'uid')
        .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
        .join(', ');
      
      if (setClause) {
        const values = [uid, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'uid')];
        await pgPool.query(`UPDATE users SET ${setClause} WHERE uid = $1`, values);
      }
    }
  }

  // Action Operations
  async createAction(actionData: Partial<Action>): Promise<Action> {
    const action: Action = {
      id: actionData.id || `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      uid: actionData.uid!,
      type: actionData.type!,
      data: actionData.data!,
      imageUrl: actionData.imageUrl,
      status: 'pending',
      tokensIssued: 0,
      predictedCO2Kg: 0,
      submitAt: new Date(),
      ...actionData
    };

    if (this.useFirestore) {
      const firestore = getFirestore();
      await firestore.collection('actions').doc(action.id).set(action);
    } else {
      await MockFirestore.collection('actions').doc(action.id).set(action);
    }

    if (this.usePG && pgPool) {
      await pgPool.query(`
        INSERT INTO actions (id, uid, type, data, image_url, status, tokens_issued, predicted_co2_kg, ml_results)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        action.id, action.uid, action.type, JSON.stringify(action.data),
        action.imageUrl, action.status, action.tokensIssued, action.predictedCO2Kg,
        JSON.stringify(action.mlResults)
      ]);
    }

    return action;
  }

  async getAction(actionId: string): Promise<Action | null> {
    try {
      if (this.useFirestore) {
        const firestore = getFirestore();
        const doc = await firestore.collection('actions').doc(actionId).get();
        return doc.exists ? doc.data() as Action : null;
      } else {
        const doc = await MockFirestore.collection('actions').doc(actionId).get();
        return doc.exists ? doc.data() as Action : null;
      }
    } catch (error) {
      console.error('Failed to get action:', error);
      return null;
    }
  }

  async getUserActions(uid: string, limit = 10): Promise<Action[]> {
    try {
      if (this.useFirestore) {
        const firestore = getFirestore();
        const snapshot = await firestore
          .collection('actions')
          .where('uid', '==', uid)
          .orderBy('submitAt', 'desc')
          .limit(limit)
          .get();
        return snapshot.docs.map(doc => doc.data() as Action);
      } else {
        // Mock implementation
        return [];
      }
    } catch (error) {
      console.error('Failed to get user actions:', error);
      return [];
    }
  }

  async updateAction(actionId: string, updates: Partial<Action>): Promise<void> {
    if (this.useFirestore) {
      const firestore = getFirestore();
      await firestore.collection('actions').doc(actionId).update(updates);
    } else {
      await MockFirestore.collection('actions').doc(actionId).update(updates);
    }

    if (this.usePG && pgPool && Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map((key, index) => {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          return `${dbKey} = $${index + 2}`;
        })
        .join(', ');
      
      if (setClause) {
        const values = [actionId, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id')];
        await pgPool.query(`UPDATE actions SET ${setClause} WHERE id = $1`, values);
      }
    }
  }

  // File Operations
  async saveUploadedFile(fileData: Partial<UploadedFile>): Promise<UploadedFile> {
    const file: UploadedFile = {
      id: fileData.id || `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      uid: fileData.uid!,
      filename: fileData.filename!,
      originalName: fileData.originalName!,
      mimeType: fileData.mimeType!,
      size: fileData.size!,
      url: fileData.url!,
      uploadedAt: new Date(),
      processed: false,
      ...fileData
    };

    if (this.useFirestore) {
      const firestore = getFirestore();
      await firestore.collection('uploaded_files').doc(file.id).set(file);
    } else {
      await MockFirestore.collection('uploaded_files').doc(file.id).set(file);
    }

    if (this.usePG && pgPool) {
      await pgPool.query(`
        INSERT INTO uploaded_files (id, uid, filename, original_name, mime_type, size_bytes, url, ml_results)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        file.id, file.uid, file.filename, file.originalName,
        file.mimeType, file.size, file.url, JSON.stringify(file.mlResults)
      ]);
    }

    return file;
  }

  async getFile(fileId: string): Promise<UploadedFile | null> {
    try {
      if (this.useFirestore) {
        const firestore = getFirestore();
        const doc = await firestore.collection('uploaded_files').doc(fileId).get();
        return doc.exists ? doc.data() as UploadedFile : null;
      } else {
        const doc = await MockFirestore.collection('uploaded_files').doc(fileId).get();
        return doc.exists ? doc.data() as UploadedFile : null;
      }
    } catch (error) {
      console.error('Failed to get file:', error);
      return null;
    }
  }

  // Transaction Operations
  async createTransaction(txData: Partial<Transaction>): Promise<Transaction> {
    const transaction: Transaction = {
      txId: txData.txId || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      uid: txData.uid!,
      type: txData.type!,
      amount: txData.amount!,
      tokenSymbol: txData.tokenSymbol || 'ECO',
      txHash: txData.txHash!,
      createdAt: new Date(),
      status: 'pending',
      ...txData
    };

    if (this.useFirestore) {
      const firestore = getFirestore();
      await firestore.collection('transactions').doc(transaction.txId).set(transaction);
    } else {
      await MockFirestore.collection('transactions').doc(transaction.txId).set(transaction);
    }

    if (this.usePG && pgPool) {
      await pgPool.query(`
        INSERT INTO transactions (tx_id, uid, type, amount, token_symbol, tx_hash, metadata, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        transaction.txId, transaction.uid, transaction.type, transaction.amount,
        transaction.tokenSymbol, transaction.txHash, JSON.stringify(transaction.metadata), transaction.status
      ]);
    }

    return transaction;
  }

  async getUserTransactions(uid: string, limit = 20): Promise<Transaction[]> {
    try {
      if (this.useFirestore) {
        const firestore = getFirestore();
        const snapshot = await firestore
          .collection('transactions')
          .where('uid', '==', uid)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
        return snapshot.docs.map(doc => doc.data() as Transaction);
      } else {
        // Return mock data
        return [
          {
            txId: 'mock_tx_1',
            uid,
            type: 'mint',
            amount: 25,
            tokenSymbol: 'ECO',
            txHash: 'mock_hash_1',
            createdAt: new Date(),
            status: 'confirmed',
            metadata: { reason: 'Energy efficiency action verified' }
          }
        ];
      }
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      return [];
    }
  }
}

export const database = new DatabaseService();
export default database;
