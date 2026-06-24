import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', 'dev-secret'),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '7d'),
  port: Number(required('PORT', '3000')),
  clientOrigin: required('CLIENT_ORIGIN', 'http://localhost:5173'),
  recoveryCodeTtl: Number(required('RECOVERY_CODE_TTL', '300')),
};
