import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { connectDB } from './db';
import User from './models/User';
import { IUser, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'ethio-parents-portal-secret-key-2024';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookieToken = request.cookies.get('token')?.value;
  return cookieToken || null;
}

export async function getAuthUser(request: NextRequest): Promise<(IUser & { _id: string }) | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId).select('-password_hash');
  return user as (IUser & { _id: string }) | null;
}

export function requireRole(...roles: UserRole[]) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);
    if (!user) {
      return { error: 'Unauthorized', status: 401 };
    }
    if (!roles.includes(user.role)) {
      return { error: 'Forbidden', status: 403 };
    }
    return { user };
  };
}
