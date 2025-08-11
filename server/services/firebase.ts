import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin - will use environment variables when available
let app: any;
let auth: any;
let firestore: any;

const FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC90aHfTAOocREj\nthych3/XmMvcHyoY+dQiJHwDXcMSU741oC5/NE0Cu/lVxK/pTy87t7ukHshtxnS4\nj+0H0Ag0iEn5uf9xJc2b+arkrlJGqVznU8OmQD9GiQiM5xGldQK8NYS0Z4IMUHIe\nMkFE5JaPnYgnpgAHomH1ip6U928SRiwQHJec6PlzP5cecUWrUAHlbao3ALHtFK+8\nuC/I8Dd0+Dxt7m1VRkYlD3/wDIlhMoDumOKJhkuaLdB0gyXlVTf8qodYbUnZSvxU\nBlvuAsgu2zAC1JnobMn9YmX47AmcyaIKO78lwc/P5cV1/oLtH7HEWZ0LuX/eTdbG\ntSwaMwWfAgMBAAECggEAFaqOb/b0ue7B9pIMXP+IY5sAtezmuLgXcxg4AYhbwkVF\nwkg41nMpUSUUliofrCFKMmZL6DVNSl5rJz/iXdBsh1aBHxyQYCFhASszyuts37zo\nKk1g2SKfNlVg4PhlBr4+5C21qoPgD7jE9dZlpc/zsYvZJTFo8nYh+U1rwXQmvO6L\n7eFoTi2BrETDO8cGTG/l2g5fxvJmZORA3b60kzsme8pzXwBxzQjiqY1lzrUlqaeB\n9r0B2nZDzddpjFi+uC3yThXWSQndyaNNHykJeMYl421+qUUFd85696LsArPxoCJh\n/lVD/6HXrUvYsM8fR12KfADPJY4FfOcx0fdK3KvhCQKBgQD1mb2NtE8TwwFrfTeJ\noTiZaJ8qjVwknK+GG1PwF6o6cwCWmOhdVPj8EjHt7uSL9n/XVKPn+aUmEH4ABynN\n2Q0jwEauDh/MP0VD2NraPuscx6D6vuGwi1CJz6O7oipFCxmZP+9xUhrK4JNoq8D0\nFaIiS0KvU8UukSvS+GywxSYidwKBgQDF2zrgYH0EyYBJsVXc18LEONVZTjqa7K70\nRyUZAZ6iROzyoO0wjBxcn9M9cAVcgqFtcn/mrg88J7fPEQY3NtkzBI0tOYdQr0nZ\nLo7QsVAUV+ZX30t4hYL1p9YwLZbKXfo5U8KdxgmRpvmXGXi1Tt0zKCTM9JLMtaQ9\nf8X2uNWYGQKBgBs8pYzlhi+G3M1y4Ynd200IET7C1oko5z5UIYbq2PIKdvI8muhe\n2A38ZpUgfTAYci0LMfIz+WCzS4XtRXGStKZWWIBNCLG6ApB3qC2z9JcIfI3SRW0y\nxgfCg0H3xgBKLtiUApXqqRX+udpN0eQ/0e9DsW2IOMHlT5rh+gvQkV4ZAoGAE9Qs\nyl/hJ6GqIbiMCl31PwUTHKgiZ3Rg9EpNBXyMEWcm+An4u2zPStkZqoaXgvX0h6t5\n9fxrunOgkDf8j3wHuH00SNwDG6r1k7Z+yZt7kw5cH2JZhfKbdVMkvB9VhWJ1uVkT\noAxA2UAKs4Hx/vmwYXgceA3qyGlL1H4BsQBFJ8ECgYEAxxc+ahP3tUnj+jmkPr3h\nviJPDhNmQ+0zJ4hE/TqOezaLiZvQzVxNn6OR0L1/VbTfW+lmwkugPr9CVRbuW/dZ\nGCYLBkiFvlHxAmBeoKBTZjqAKV2WwIyZlkDnvp9eZoHrxJshmEfreDWL6EXPWKh0\nwBwgbDWDT5IJqmABr9YWNXA=\n-----END PRIVATE KEY-----\n";

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || "ecox-35c66",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@ecox-35c66.iam.gserviceaccount.com",
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
