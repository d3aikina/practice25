import { env } from '../config/env';

interface CodeEntry {
  code: string;
  userId: number;
  expiresAt: number;
}

const store = new Map<string, CodeEntry>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function issueCode(phone: string, userId: number): string {
  const code = generateCode();
  store.set(phone, {
    code,
    userId,
    expiresAt: Date.now() + env.recoveryCodeTtl * 1000,
  });
  return code;
}

export function consumeCode(phone: string, code: string): number | null {
  const entry = store.get(phone);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(phone);
    return null;
  }
  if (entry.code !== code) return null;
  store.delete(phone);
  return entry.userId;
}
