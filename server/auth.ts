import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  static async createUser(userData: { username: string; email?: string; password: string; role?: 'admin' | 'user' }) {
    const hashedPassword = await this.hashPassword(userData.password);
    return storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
    });
  }

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await storage.getUserByUsername(username);
    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);
    
    return user;
  }

  static async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await storage.getUserByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const resetToken = this.generateResetToken();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    await storage.setPasswordResetToken(user.id, resetToken, expiry);
    return resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await storage.getUserByResetToken(token);
    if (!user) {
      return false;
    }

    // Check if token is expired
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await storage.updateUserPassword(user.id, hashedPassword);
    await storage.clearPasswordResetToken(user.id);
    
    return true;
  }
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'No autorizado - Debes iniciar sesión' });
  }
  next();
}

// Admin authorization middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'No autorizado - Debes iniciar sesión' });
  }

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado - Se requieren permisos de administrador' });
  }

  next();
}

// Middleware to load user from session
export async function loadUser(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  next();
}

// Session configuration
export async function configureSession() {
  const session = (await import('express-session')).default;
  const memorystore = (await import('memorystore')).default;
  
  const MemoryStore = memorystore(session);
  
  return session({
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}