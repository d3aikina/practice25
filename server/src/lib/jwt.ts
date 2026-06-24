import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;
}
