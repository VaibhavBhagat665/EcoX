/**
 * Firebase Admin SDK configuration for EcoX backend
 * Handles authentication and Firestore operations
 */

import admin from 'firebase-admin';

// Environment variables with fallbacks
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '__SET_IN_REPLIT_SECRETS__';
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || '__SET_IN_REPLIT_SECRETS__';
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || '__SET_IN_REPLIT_SECRETS__';
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || '';

const MOCK_MODE = process.env.MOCK_FIREBASE_SERVICE === 'true' || 
                  FIREBASE_PROJECT_ID === '__SET_IN_REPLIT_SECRETS__' ||
                  !FIREBASE_PROJECT_ID || 
                  !FIREBASE_PRIVATE_KEY || 
                  !FIREBASE_CLIENT_EMAIL;

let firebaseApp: admin.app.App | null = null;
let firestore: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase(): void {
  if (MOCK_MODE) {
    console.log('🔄 Firebase running in MOCK MODE - no real connections will be made');
    return;
  }

  try {
    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: FIREBASE_DATABASE_URL,
      });

      firestore = admin.firestore();
      auth = admin.auth();

      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    console.log('🔄 Falling back to mock mode');
  }
}

/**
 * Get Firestore instance
 */
export function getFirestore(): admin.firestore.Firestore {
  if (MOCK_MODE || !firestore) {
    throw new Error('Firestore not available - running in mock mode');
  }
  return firestore;
}

/**
 * Get Auth instance
 */
export function getAuth(): admin.auth.Auth {
  if (MOCK_MODE || !auth) {
    throw new Error('Auth not available - running in mock mode');
  }
  return auth;
}

/**
 * Check if running in mock mode
 */
export function isMockMode(): boolean {
  return MOCK_MODE;
}

/**
 * Verify Firebase ID token
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  if (MOCK_MODE) {
    // Return mock decoded token in development
    return {
      uid: 'mock-user-id',
      email: 'mock@example.com',
      name: 'Mock User',
      aud: 'mock-audience',
      auth_time: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
      firebase: {
        identities: {},
        sign_in_provider: 'mock'
      },
      iat: Date.now() / 1000,
      iss: 'mock-issuer',
      sub: 'mock-user-id'
    } as admin.auth.DecodedIdToken;
  }

  const auth = getAuth();
  return await auth.verifyIdToken(idToken);
}

/**
 * Mock Firestore operations for development
 */
export class MockFirestore {
  private static data: Map<string, any> = new Map();

  static collection(path: string) {
    return {
      doc: (id: string) => ({
        get: async () => ({
          exists: MockFirestore.data.has(`${path}/${id}`),
          data: () => MockFirestore.data.get(`${path}/${id}`),
          id,
        }),
        set: async (data: any) => {
          MockFirestore.data.set(`${path}/${id}`, { ...data, id });
          return { writeTime: new Date() };
        },
        update: async (data: any) => {
          const existing = MockFirestore.data.get(`${path}/${id}`) || {};
          MockFirestore.data.set(`${path}/${id}`, { ...existing, ...data });
          return { writeTime: new Date() };
        },
        delete: async () => {
          MockFirestore.data.delete(`${path}/${id}`);
          return { writeTime: new Date() };
        },
      }),
      add: async (data: any) => {
        const id = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        MockFirestore.data.set(`${path}/${id}`, { ...data, id });
        return { id };
      },
      where: () => ({
        get: async () => ({
          docs: Array.from(MockFirestore.data.entries())
            .filter(([key]) => key.startsWith(path))
            .map(([key, value]) => ({
              id: key.split('/').pop(),
              data: () => value,
            })),
        }),
      }),
      get: async () => ({
        docs: Array.from(MockFirestore.data.entries())
          .filter(([key]) => key.startsWith(path))
          .map(([key, value]) => ({
            id: key.split('/').pop(),
            data: () => value,
          })),
      }),
    };
  }

  static clearData() {
    MockFirestore.data.clear();
  }
}

// Initialize Firebase on module load
initializeFirebase();
