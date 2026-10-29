import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'tingroster_dev_jwt_secret_change_in_production_min_32_chars';
const COOKIE_NAME = 'tingroster_session';

export interface TokenPayload {
  userId: string;
  email: string;
  planType: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        bankId: true,
        bankAccountNo: true,
        bankAccountName: true,
        logoUrl: true,
        avatarUrl: true,
        planType: true,
        createdAt: true,
      },
    });
    return user;
  } catch (err) {
    console.error('Session retrieval error:', err);
    return null;
  }
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/, '');
  if (!token) return null;
  const payload = verifySessionToken(token);
  return payload?.userId || null;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
