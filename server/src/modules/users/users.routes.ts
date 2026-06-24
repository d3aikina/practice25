import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { hashPassword } from '../../lib/hash';
import { publicUser } from '../../lib/serialize';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler, HttpError } from '../../middleware/errorHandler';

const router = Router();

const createUserSchema = z.object({
  role: z.enum(['Client', 'Manager', 'Master', 'Admin']),
  login: z.string().min(3).max(50).optional(),
  password: z.string().min(4).max(100).optional(),
  fullName: z.string().min(1).max(150),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
});

const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(4).max(100).optional(),
});

const profileSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
});

router.patch(
  '/me',
  authenticate,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        fullName: req.body.fullName,
        phone: req.body.phone,
        email: req.body.email || null,
      },
    });
    res.json({ user: publicUser(user) });
  }),
);

router.use(authenticate, requireRole('Admin'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.query.role as string | undefined;
    const users = await prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      orderBy: { id: 'asc' },
    });
    res.json(users.map(publicUser));
  }),
);

router.post(
  '/',
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { role, login, password, fullName, phone, email } = req.body;
    if (login) {
      const exists = await prisma.user.findUnique({ where: { login } });
      if (exists) throw new HttpError(409, 'Логин уже занят');
    }
    const user = await prisma.user.create({
      data: {
        role,
        login: login || null,
        passwordHash: password ? await hashPassword(password) : null,
        fullName,
        phone: phone || null,
        email: email || null,
      },
    });
    res.status(201).json({ user: publicUser(user) });
  }),
);

router.patch(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { role, login, password, fullName, phone, email } = req.body;
    if (login) {
      const exists = await prisma.user.findUnique({ where: { login } });
      if (exists && exists.id !== id) throw new HttpError(409, 'Логин уже занят');
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        login,
        fullName,
        phone,
        email: email === '' ? null : email,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
    res.json({ user: publicUser(user) });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user!.sub) throw new HttpError(400, 'Нельзя удалить самого себя');
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  }),
);

export default router;
