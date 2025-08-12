/**
 * Firebase authentication middleware for EcoX backend
 * Verifies Firebase ID tokens and sets user context
 */

import { Request, Response, NextFunction } from 'express';
import { verifyIdToken, isMockMode } from '../lib/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    [key: string]: any;
  };
  isAuthenticated?: boolean;
}

/**
 * Middleware to verify Firebase ID token
 */
export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isMockMode()) {
        // In mock mode, allow requests without auth for development
        console.log('🔄 Mock mode: Allowing request without authentication');
        req.user = {
          uid: 'mock-user-id',
          email: 'mock@example.com',
          name: 'Mock User'
        };
        req.isAuthenticated = true;
        return next();
      }
      
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authorization header missing or invalid format' 
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
      return;
    }

    // Verify the token
    const decodedToken = await verifyIdToken(idToken);
    
    // Set user context
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      // Add other relevant fields from the token (excluding uid to avoid duplication)
      ...Object.fromEntries(
        Object.entries(decodedToken).filter(([key]) => key !== 'uid' && key !== 'email' && key !== 'name')
      )
    };
    req.isAuthenticated = true;

    console.log(`✅ User authenticated: ${req.user.uid} (${req.user.email})`);
    next();

  } catch (error) {
    console.error('❌ Firebase token verification failed:', error);
    
    if (isMockMode()) {
      // In mock mode, fallback to mock user on token verification failure
      console.log('🔄 Mock mode: Token verification failed, using mock user');
      req.user = {
        uid: 'mock-user-id',
        email: 'mock@example.com',
        name: 'Mock User'
      };
      req.isAuthenticated = true;
      return next();
    }
    
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token' 
    });
  }
}

/**
 * Optional authentication middleware - doesn't require auth but sets user if available
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      if (idToken) {
        const decodedToken = await verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name
        };
        req.isAuthenticated = true;
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth - just continue without user context
    console.warn('⚠️ Optional auth failed, continuing without user context:', error);
    next();
  }
}

/**
 * Admin role check middleware (use after verifyFirebaseToken)
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    });
    return;
  }

  // Check if user has admin role (you'll need to implement your admin logic)
  const isAdmin = req.user.role === 'admin' || 
                  req.user.customClaims?.admin === true ||
                  (isMockMode() && req.user.uid === 'mock-user-id');

  if (!isAdmin) {
    res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Admin access required' 
    });
    return;
  }

  next();
}

/**
 * CORS middleware with environment-based origins
 */
export function configureCORS() {
  const corsOrigins = process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'http://localhost:5173']; // Default dev origins

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (corsOrigins.includes('*') || (origin && corsOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  };
}
