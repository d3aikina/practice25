import type { User } from '@prisma/client';

export function publicUser(user: User) {
  return {
    id: user.id,
    role: user.role,
    login: user.login,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    hasCredentials: Boolean(user.login && user.passwordHash),
  };
}
