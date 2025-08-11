import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDZE_UtX8nXri2eSzC-ohVRWAzeZiV3eo8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ecox-35c66.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecox-35c66",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecox-35c66.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "452390151252",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:452390151252:web:eba29c7c75c659283d39c1", 
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DC0YSCWSVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    // If popup is blocked, fallback to redirect
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

export const signOutUser = () => signOut(auth);

export const handleRedirectResult = () => getRedirectResult(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) => 
  onAuthStateChanged(auth, callback);

// Email/Password Authentication
export const createUserWithEmail = async (email: string, password: string, displayName?: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with display name if provided
  if (displayName && result.user) {
    await updateProfile(result.user, {
      displayName: displayName
    });
  }
  
  return result;
};

export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Firestore functions
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  carbonFootprint: number;
  energyUsage: number;
  ecoScore: number;
  challenges: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EnvironmentalMetrics {
  temperature: number;
  humidity: number;
  airQuality: string;
  energyUsage: number;
  carbonFootprint: number;
  timestamp: Timestamp;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  createdAt: Timestamp;
}

export const createUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const userData: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      carbonFootprint: 0,
      energyUsage: 0,
      ecoScore: 100,
      challenges: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(userRef, userData);
  }
  
  return userRef;
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
};

export const updateUserMetrics = async (uid: string, metrics: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...metrics,
    updatedAt: Timestamp.now()
  });
};

export const saveEnvironmentalMetrics = async (uid: string, metrics: Omit<EnvironmentalMetrics, 'timestamp'>) => {
  const metricsRef = doc(collection(db, 'environmental-metrics'));
  await setDoc(metricsRef, {
    ...metrics,
    userId: uid,
    timestamp: Timestamp.now()
  });
};

export const saveAIRecommendation = async (uid: string, recommendation: Omit<AIRecommendation, 'id' | 'createdAt'>) => {
  const recommendationRef = doc(collection(db, 'ai-recommendations'));
  await setDoc(recommendationRef, {
    ...recommendation,
    id: recommendationRef.id,
    userId: uid,
    createdAt: Timestamp.now()
  });
};