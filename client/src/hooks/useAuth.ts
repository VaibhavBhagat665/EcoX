import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  handleRedirectResult, 
  onAuthStateChange,
  createUserProfile,
  getUserProfile,
  UserProfile,
  createUserWithEmail,
  signInWithEmail,
  resetPassword
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

interface SignInData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  const { toast } = useToast();

  // FIXED: Stabilize the toast function reference
  const stableToast = useCallback((options: any) => {
    toast(options);
  }, []); // Empty dependency - toast is stable from the hook

  // FIXED: Memoize helper functions to prevent dependency loops
  const getAuthErrorMessage = useCallback((errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/popup-blocked':
        return 'Popup was blocked. Please allow popups and try again';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      default:
        return 'An error occurred during authentication';
    }
  }, []);

  // FIXED: Stabilize clearError function
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // FIXED: Main useEffect with proper dependency management
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Handle redirect result on page load
        const result = await handleRedirectResult();
        if (result?.user && isMounted) {
          stableToast({
            title: "Welcome to EcoX!",
            description: "Successfully signed in with Google",
          });
        }
      } catch (error: any) {
        console.error('Redirect auth error:', error);
        if (isMounted) {
          setAuthState(prev => ({ 
            ...prev, 
            error: error.message || 'Authentication failed' 
          }));
          stableToast({
            title: "Authentication Error",
            description: error.message || 'Failed to sign in',
            variant: "destructive",
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!isMounted) return;

      setAuthState(prev => ({ ...prev, user, loading: false }));
      
      if (user) {
        try {
          // Create or get user profile
          await createUserProfile(user);
          const profile = await getUserProfile(user.uid);
          if (isMounted) {
            setAuthState(prev => ({ ...prev, userProfile: profile }));
          }
        } catch (error: any) {
          console.error('Error handling user profile:', error);
          if (isMounted) {
            setAuthState(prev => ({ 
              ...prev, 
              error: 'Failed to load user profile' 
            }));
          }
        }
      } else if (isMounted) {
        setAuthState(prev => ({ ...prev, userProfile: null }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // FIXED: Empty dependency array - all dependencies are stable

  // Sign up with email and password
  const signUp = useCallback(async ({ email, password, displayName }: SignUpData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await createUserWithEmail(email, password, displayName);
      
      stableToast({
        title: "Account Created!",
        description: "Welcome to EcoX! Your account has been created successfully.",
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      stableToast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [getAuthErrorMessage, stableToast]);

  // Sign in with email and password
  const signInWithEmailPassword = useCallback(async ({ email, password }: SignInData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await signInWithEmail(email, password);
      
      stableToast({
        title: "Welcome Back!",
        description: "Successfully signed in to EcoX",
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      stableToast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [getAuthErrorMessage, stableToast]);

  // Sign in with Google
  const signInWithGoogleAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await signInWithGoogle();
      
      if (result) {
        stableToast({
          title: "Welcome to EcoX!",
          description: "Successfully signed in with Google",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      stableToast({
        title: "Google Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [getAuthErrorMessage, stableToast]);

  // Reset password
  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
      stableToast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      stableToast({
        title: "Password Reset Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [getAuthErrorMessage, stableToast]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOutUser();
      stableToast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Sign out failed' 
      }));
      stableToast({
        title: "Sign Out Error",
        description: error.message || 'Failed to sign out',
        variant: "destructive",
      });
    }
  }, [stableToast]);

  // Get user display info - memoized to prevent changes
  const getUserDisplayInfo = useMemo(() => {
    if (!authState.user) return null;
    
    return {
      name: authState.user.displayName || authState.userProfile?.displayName || 'User',
      email: authState.user.email || '',
      photoURL: authState.user.photoURL || authState.userProfile?.photoURL || '',
      uid: authState.user.uid,
    };
  }, [authState.user, authState.userProfile]);

  // Check if user is authenticated - memoized
  const isAuthenticated = useMemo(() => !!authState.user, [authState.user]);

  // FIXED: Return stable object with useMemo
  return useMemo(() => ({
    user: authState.user,
    userProfile: authState.userProfile,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated,
    signUp,
    signInWithEmailPassword,
    signInWithGoogleAuth,
    sendPasswordReset,
    signOut,
    getUserDisplayInfo,
    clearError,
  }), [
    authState.user,
    authState.userProfile,
    authState.loading,
    authState.error,
    isAuthenticated,
    signUp,
    signInWithEmailPassword,
    signInWithGoogleAuth,
    sendPasswordReset,
    signOut,
    getUserDisplayInfo,
    clearError,
  ]);
};