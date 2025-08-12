import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../services/firebase';
import { storage } from '../storage';

interface AuthenticatedRequest extends Request {
  user?: any;
  isAdmin?: boolean;
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No valid authorization header' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    const user = await storage.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export async function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No valid authorization header' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    const admin = await storage.getAdminByFirebaseUid(decodedToken.uid);
    if (!admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = admin;
    req.isAdmin = true;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}
