/**
 * Firestore seed script for EcoX development
 * Creates sample data for testing and demonstration
 */

import { getFirestore, MockFirestore, isMockMode } from '../lib/firebase';

interface SeedData {
  users: any[];
  actions: any[];
  transactions: any[];
  leaderboard: any;
}

/**
 * Generate sample seed data
 */
function generateSeedData(): SeedData {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Sample users
  const users = [
    {
      uid: 'user_alice_123',
      name: 'Alice Green',
      email: 'alice.green@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      walletAddress: '0x1234567890123456789012345678901234567890',
      totalTokens: 247,
      carbonSavedKg: 156.7,
      joinedAt: oneMonthAgo,
      lastActionAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      preferences: {
        notifications: true,
        publicProfile: true,
        language: 'en'
      },
      stats: {
        actionsSubmitted: 12,
        actionsVerified: 10,
        streakDays: 7
      }
    },
    {
      uid: 'user_bob_456',
      name: 'Bob Earth',
      email: 'bob.earth@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      walletAddress: '0x2345678901234567890123456789012345678901',
      totalTokens: 189,
      carbonSavedKg: 98.3,
      joinedAt: new Date(oneMonthAgo.getTime() - 5 * 24 * 60 * 60 * 1000),
      lastActionAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      preferences: {
        notifications: true,
        publicProfile: true,
        language: 'en'
      },
      stats: {
        actionsSubmitted: 8,
        actionsVerified: 7,
        streakDays: 3
      }
    },
    {
      uid: 'user_carol_789',
      name: 'Carol Forest',
      email: 'carol.forest@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
      walletAddress: '0x3456789012345678901234567890123456789012',
      totalTokens: 321,
      carbonSavedKg: 234.1,
      joinedAt: new Date(oneMonthAgo.getTime() - 10 * 24 * 60 * 60 * 1000),
      lastActionAt: oneWeekAgo,
      preferences: {
        notifications: false,
        publicProfile: true,
        language: 'en'
      },
      stats: {
        actionsSubmitted: 15,
        actionsVerified: 13,
        streakDays: 0
      }
    },
    {
      uid: 'user_david_012',
      name: 'David Ocean',
      email: 'david.ocean@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      walletAddress: '0x4567890123456789012345678901234567890123',
      totalTokens: 156,
      carbonSavedKg: 87.9,
      joinedAt: new Date(oneMonthAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
      lastActionAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      preferences: {
        notifications: true,
        publicProfile: false,
        language: 'en'
      },
      stats: {
        actionsSubmitted: 6,
        actionsVerified: 5,
        streakDays: 1
      }
    },
    {
      uid: 'user_eva_345',
      name: 'Eva Solar',
      email: 'eva.solar@example.com',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
      walletAddress: '0x5678901234567890123456789012345678901234',
      totalTokens: 278,
      carbonSavedKg: 198.4,
      joinedAt: new Date(oneMonthAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
      lastActionAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      preferences: {
        notifications: true,
        publicProfile: true,
        language: 'en'
      },
      stats: {
        actionsSubmitted: 11,
        actionsVerified: 9,
        streakDays: 5
      }
    }
  ];

  // Sample actions
  const actions = [
    {
      id: 'action_alice_001',
      uid: 'user_alice_123',
      type: 'energy',
      data: {
        kWh: 450,
        billAmount: 89.50,
        description: 'Monthly electricity bill - LED upgrade completed'
      },
      imageUrl: 'https://example.com/bill_images/alice_jan_2024.jpg',
      status: 'verified',
      tokensIssued: 15,
      predictedCO2Kg: 187.2,
      submitAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      verifyAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      txHash: 'mock_tx_alice_001',
      aiAnalysis: 'Verification successful: Data consistency confirmed (5.2% variance)',
      confidence: 0.92
    },
    {
      id: 'action_bob_001',
      uid: 'user_bob_456',
      type: 'transport',
      data: {
        mode: 'bicycle',
        distance: 25,
        description: 'Biked to work instead of driving'
      },
      status: 'verified',
      tokensIssued: 8,
      predictedCO2Kg: 6.7,
      submitAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      verifyAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      txHash: 'mock_tx_bob_001',
      aiAnalysis: 'Transport action verified: CO2 savings calculated based on distance and mode',
      confidence: 0.85
    },
    {
      id: 'action_carol_001',
      uid: 'user_carol_789',
      type: 'solar',
      data: {
        kWh: 280,
        systemSize: '5kW',
        description: 'Solar panel installation - first month generation'
      },
      imageUrl: 'https://example.com/solar_images/carol_system.jpg',
      status: 'verified',
      tokensIssued: 42,
      predictedCO2Kg: 116.8,
      submitAt: oneWeekAgo,
      verifyAt: new Date(oneWeekAgo.getTime() + 15 * 60 * 1000),
      txHash: 'mock_tx_carol_001',
      aiAnalysis: 'Solar generation verified: High confidence renewable energy production',
      confidence: 0.96
    },
    {
      id: 'action_david_001',
      uid: 'user_david_012',
      type: 'waste',
      data: {
        type: 'composting',
        weight: 15,
        description: 'Monthly composting program participation'
      },
      status: 'verified',
      tokensIssued: 5,
      predictedCO2Kg: 8.2,
      submitAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      verifyAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000),
      txHash: 'mock_tx_david_001',
      aiAnalysis: 'Waste reduction action verified: Composting impact calculated',
      confidence: 0.78
    },
    {
      id: 'action_eva_001',
      uid: 'user_eva_345',
      type: 'energy',
      data: {
        kWh: 320,
        billAmount: 65.40,
        description: 'Energy efficiency improvements - smart thermostat'
      },
      imageUrl: 'https://example.com/bill_images/eva_jan_2024.jpg',
      status: 'pending',
      tokensIssued: 0,
      predictedCO2Kg: 0,
      submitAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      verifyAt: null,
      txHash: null,
      aiAnalysis: null,
      confidence: null
    },
    {
      id: 'action_alice_002',
      uid: 'user_alice_123',
      type: 'water',
      data: {
        gallons: 45,
        action: 'low_flow_fixtures',
        description: 'Installed low-flow showerheads and faucets'
      },
      status: 'rejected',
      tokensIssued: 0,
      predictedCO2Kg: 0,
      submitAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      verifyAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
      txHash: null,
      aiAnalysis: 'Insufficient evidence: No supporting documentation provided',
      confidence: 0.23
    }
  ];

  // Sample transactions
  const transactions = [
    {
      txId: 'mint_alice_001',
      uid: 'user_alice_123',
      type: 'mint',
      amount: 15,
      tokenSymbol: 'ECO',
      txHash: 'mock_tx_alice_001',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      metadata: {
        actionId: 'action_alice_001',
        reason: 'Energy efficiency action verified',
        verificationConfidence: 0.92,
        co2Saved: 187.2
      },
      status: 'confirmed'
    },
    {
      txId: 'mint_bob_001',
      uid: 'user_bob_456',
      type: 'mint',
      amount: 8,
      tokenSymbol: 'ECO',
      txHash: 'mock_tx_bob_001',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      metadata: {
        actionId: 'action_bob_001',
        reason: 'Transport efficiency verified',
        verificationConfidence: 0.85,
        co2Saved: 6.7
      },
      status: 'confirmed'
    },
    {
      txId: 'mint_carol_001',
      uid: 'user_carol_789',
      type: 'mint',
      amount: 42,
      tokenSymbol: 'ECO',
      txHash: 'mock_tx_carol_001',
      createdAt: oneWeekAgo,
      metadata: {
        actionId: 'action_carol_001',
        reason: 'Solar energy generation verified',
        verificationConfidence: 0.96,
        co2Saved: 116.8
      },
      status: 'confirmed'
    },
    {
      txId: 'mint_david_001',
      uid: 'user_david_012',
      type: 'mint',
      amount: 5,
      tokenSymbol: 'ECO',
      txHash: 'mock_tx_david_001',
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      metadata: {
        actionId: 'action_david_001',
        reason: 'Waste reduction verified',
        verificationConfidence: 0.78,
        co2Saved: 8.2
      },
      status: 'confirmed'
    }
  ];

  // Sample leaderboard
  const leaderboard = {
    period: 'monthly',
    region: 'global',
    lastUpdated: now,
    entries: [
      {
        uid: 'user_carol_789',
        name: 'Carol Forest',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        score: 342,
        tokens: 321,
        carbonSaved: 234.1,
        rank: 1,
        change: 2
      },
      {
        uid: 'user_eva_345',
        name: 'Eva Solar',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
        score: 298,
        tokens: 278,
        carbonSaved: 198.4,
        rank: 2,
        change: -1
      },
      {
        uid: 'user_alice_123',
        name: 'Alice Green',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        score: 267,
        tokens: 247,
        carbonSaved: 156.7,
        rank: 3,
        change: 1
      },
      {
        uid: 'user_bob_456',
        name: 'Bob Earth',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        score: 234,
        tokens: 189,
        carbonSaved: 98.3,
        rank: 4,
        change: -2
      },
      {
        uid: 'user_david_012',
        name: 'David Ocean',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        score: 198,
        tokens: 156,
        carbonSaved: 87.9,
        rank: 5,
        change: 0
      }
    ]
  };

  return { users, actions, transactions, leaderboard };
}

/**
 * Seed Firestore with sample data
 */
export async function seedFirestore(): Promise<void> {
  console.log('🌱 Starting Firestore seeding...');

  try {
    const seedData = generateSeedData();

    if (isMockMode()) {
      console.log('🔄 Seeding Mock Firestore...');
      
      // Clear existing mock data
      MockFirestore.clearData();

      // Seed users
      for (const user of seedData.users) {
        await MockFirestore.collection('users').doc(user.uid).set(user);
      }
      console.log(`✅ Seeded ${seedData.users.length} users`);

      // Seed actions
      for (const action of seedData.actions) {
        await MockFirestore.collection('actions').doc(action.id).set(action);
      }
      console.log(`✅ Seeded ${seedData.actions.length} actions`);

      // Seed transactions
      for (const transaction of seedData.transactions) {
        await MockFirestore.collection('transactions').doc(transaction.txId).set(transaction);
      }
      console.log(`✅ Seeded ${seedData.transactions.length} transactions`);

      // Seed leaderboard
      await MockFirestore.collection('leaderboard').doc('monthly').set(seedData.leaderboard);
      console.log('✅ Seeded leaderboard');

    } else {
      console.log('📊 Seeding Real Firestore...');
      
      const firestore = getFirestore();

      // Seed users
      const userBatch = firestore.batch();
      for (const user of seedData.users) {
        const userRef = firestore.collection('users').doc(user.uid);
        userBatch.set(userRef, user);
      }
      await userBatch.commit();
      console.log(`✅ Seeded ${seedData.users.length} users`);

      // Seed actions
      const actionBatch = firestore.batch();
      for (const action of seedData.actions) {
        const actionRef = firestore.collection('actions').doc(action.id);
        actionBatch.set(actionRef, action);
      }
      await actionBatch.commit();
      console.log(`✅ Seeded ${seedData.actions.length} actions`);

      // Seed transactions
      const transactionBatch = firestore.batch();
      for (const transaction of seedData.transactions) {
        const transactionRef = firestore.collection('transactions').doc(transaction.txId);
        transactionBatch.set(transactionRef, transaction);
      }
      await transactionBatch.commit();
      console.log(`✅ Seeded ${seedData.transactions.length} transactions`);

      // Seed leaderboard
      await firestore.collection('leaderboard').doc('monthly').set(seedData.leaderboard);
      console.log('✅ Seeded leaderboard');
    }

    console.log('🎉 Firestore seeding completed successfully!');

  } catch (error) {
    console.error('❌ Firestore seeding failed:', error);
    throw error;
  }
}

/**
 * Clear all seed data (for testing)
 */
export async function clearSeedData(): Promise<void> {
  console.log('🧹 Clearing seed data...');

  try {
    if (isMockMode()) {
      MockFirestore.clearData();
      console.log('✅ Mock data cleared');
    } else {
      const firestore = getFirestore();
      
      // Note: In production, you'd want more sophisticated cleanup
      // This is a simple implementation for development
      const collections = ['users', 'actions', 'transactions', 'leaderboard'];
      
      for (const collectionName of collections) {
        const snapshot = await firestore.collection(collectionName).get();
        const batch = firestore.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        if (!snapshot.empty) {
          await batch.commit();
        }
      }
      
      console.log('✅ Real Firestore data cleared');
    }
  } catch (error) {
    console.error('❌ Failed to clear seed data:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'seed') {
    seedFirestore()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (command === 'clear') {
    clearSeedData()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    console.log('Usage: npm run seed:firestore [seed|clear]');
    process.exit(1);
  }
}
