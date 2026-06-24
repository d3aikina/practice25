import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }
    next();
  };
}
