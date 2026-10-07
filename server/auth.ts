import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db, hashPassword } from './db.js';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT';
  specialization: string;
  skills: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      token?: string;
    }
  }
}

export function loginUser(email: string, password: string): { token: string; user: UserPayload } | null {
  const query = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = query.get(email) as any;

  if (!user) return null;

  const inputHash = hashPassword(password);
  if (user.password_hash !== inputHash) return null;

  // Generate secure session token
  const token = `token_${crypto.randomBytes(24).toString('hex')}`;
  const insertSession = db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)');
  insertSession.run(token, user.id);

  const payload: UserPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: user.specialization,
    skills: user.skills,
  };

  return { token, user: payload };
}

export function getUserByToken(token: string): UserPayload | null {
  const query = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.specialization, u.skills
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `);
  const user = query.get(token) as any;
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: user.specialization,
    skills: user.skills,
  };
}

export function logoutUser(token: string) {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

// Middleware: Verify Token
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query.token) {
    token = String(req.query.token);
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  req.user = user;
  req.token = token;
  next();
}

// Middleware: Require Admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}
