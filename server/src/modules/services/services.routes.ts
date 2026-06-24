import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

const serviceSchema = z.object({
  name: z.string().min(1).max(150),
  basePrice: z.number().min(0).nullable().optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
});

router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    res.json(services);
  }),
);

router.use(authenticate, requireRole('Admin'));

router.post(
  '/',
  validate(serviceSchema),
  asyncHandler(async (req, res) => {
    const service = await prisma.service.create({
      data: {
        name: req.body.name,
        basePrice: req.body.basePrice ?? null,
        description: req.body.description || null,
      },
    });
    res.status(201).json(service);
  }),
);

router.patch(
  '/:id',
  validate(serviceSchema.partial()),
  asyncHandler(async (req, res) => {
    const service = await prisma.service.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        basePrice: req.body.basePrice,
        description: req.body.description,
      },
    });
    res.json(service);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.service.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  }),
);

export default router;
