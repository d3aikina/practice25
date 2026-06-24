import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { publicUser } from '../../lib/serialize';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler, HttpError } from '../../middleware/errorHandler';

const router = Router();

router.use(authenticate, requireRole('Manager', 'Admin'));

const createClientSchema = z.object({
  fullName: z.string().min(1).max(150),
  phone: z.string().min(3).max(20),
  email: z.string().email().max(100).optional().or(z.literal('')),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = (req.query.search as string | undefined)?.trim();
    const clients = await prisma.user.findMany({
      where: {
        role: 'Client',
        ...(search
          ? {
              OR: [
                { phone: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { fullName: 'asc' },
      take: 20,
    });
    res.json(clients.map(publicUser));
  }),
);

router.post(
  '/',
  validate(createClientSchema),
  asyncHandler(async (req, res) => {
    const { fullName, phone, email } = req.body;
    const existing = await prisma.user.findFirst({ where: { role: 'Client', phone } });
    if (existing) {
      throw new HttpError(409, 'Клиент с таким телефоном уже существует');
    }
    const client = await prisma.user.create({
      data: { role: 'Client', fullName, phone, email: email || null },
    });
    res.status(201).json({ user: publicUser(client) });
  }),
);

export default router;
