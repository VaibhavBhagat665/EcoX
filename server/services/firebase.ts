import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin - will use environment variables when available
let app: any;
let auth: any;
let firestore: any;

const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || "ecox-35c66",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@ecox-35c66.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    
    auth = getAuth(app);
    firestore = getFirestore(app);
  } else {
    console.warn('Firebase Admin credentials not found. Authentication will be mocked for development.');
    // Mock services for development
    auth = {
      verifyIdToken: async () => ({ uid: 'mock-admin-uid' }),
      getUser: async () => ({ uid: 'mock-admin-uid', email: 'admin@ecox.com' })
    };
    firestore = {};
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  // Fallback mock services
  auth = {
    verifyIdToken: async () => ({ uid: 'mock-admin-uid' }),
    getUser: async () => ({ uid: 'mock-admin-uid', email: 'admin@ecox.com' })
  };
  firestore = {};
}

export { auth, firestore };

export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getUserByUid(uid: string) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    throw new Error('User not found');
  }
}
