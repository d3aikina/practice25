import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { hashPassword, verifyPassword } from '../../lib/hash';
import { signToken } from '../../lib/jwt';
import { issueCode, consumeCode } from '../../lib/recoveryCodes';
import { publicUser } from '../../lib/serialize';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { asyncHandler, HttpError } from '../../middleware/errorHandler';

const router = Router();

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

const phoneSchema = z.object({
  phone: z.string().min(3),
});

const verifySchema = z.object({
  phone: z.string().min(3),
  code: z.string().length(6),
});

const setCredentialsSchema = z.object({
  login: z.string().min(3).max(50),
  password: z.string().min(4).max(100),
});

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { login, password } = req.body;
    const user = await prisma.user.findUnique({ where: { login } });
    if (!user || !user.passwordHash) {
      throw new HttpError(401, 'Неверный логин или пароль');
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Неверный логин или пароль');
    }
    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user: publicUser(user) });
  }),
);

router.post(
  '/request-code',
  validate(phoneSchema),
  asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      throw new HttpError(404, 'Пользователь с таким номером не найден');
    }
    const code = issueCode(phone, user.id);
    res.json({
      message: 'Код отправлен',
      demoCode: code,
      phone,
    });
  }),
);

router.post(
  '/verify-code',
  validate(verifySchema),
  asyncHandler(async (req, res) => {
    const { phone, code } = req.body;
    const userId = consumeCode(phone, code);
    if (userId === null) {
      throw new HttpError(401, 'Неверный или просроченный код');
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError(404, 'Пользователь не найден');
    }
    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user: publicUser(user) });
  }),
);

router.post(
  '/set-credentials',
  authenticate,
  validate(setCredentialsSchema),
  asyncHandler(async (req, res) => {
    const { login, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { login } });
    if (existing && existing.id !== req.user!.sub) {
      throw new HttpError(409, 'Логин уже занят');
    }
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: { login, passwordHash: await hashPassword(password) },
    });
    res.json({ user: publicUser(user) });
  }),
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new HttpError(404, 'Пользователь не найден');
    res.json({ user: publicUser(user) });
  }),
);

export default router;
