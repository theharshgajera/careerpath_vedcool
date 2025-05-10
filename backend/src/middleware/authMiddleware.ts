import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token received:', token);
    if (!token) {
      console.log('No token provided');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log('Token decoded successfully:', decoded);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Token verification failed:', errorMessage);
    res.status(403).json({ message: 'Invalid token', error: errorMessage });
  }
};

// Keep isAdmin for potential future use, but make it a no-op for now
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  // Since any logged-in user can access the admin panel, just proceed
  next();
};