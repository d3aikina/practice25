import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

const materialSchema = z.object({
  name: z.string().min(1).max(150),
  unit: z.string().max(20).optional().or(z.literal('')),
  price: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).optional(),
});

const stockSchema = z.object({
  delta: z.number().int(),
});

router.get(
  '/',
  authenticate,
  requireRole('Master', 'Manager', 'Admin'),
  asyncHandler(async (_req, res) => {
    const materials = await prisma.material.findMany({ orderBy: { name: 'asc' } });
    res.json(materials);
  }),
);

router.patch(
  '/:id/stock',
  authenticate,
  requireRole('Manager', 'Admin'),
  validate(stockSchema),
  asyncHandler(async (req, res) => {
    const material = await prisma.material.update({
      where: { id: Number(req.params.id) },
      data: { stock: { increment: req.body.delta } },
    });
    res.json(material);
  }),
);

router.use(authenticate, requireRole('Admin'));

router.post(
  '/',
  validate(materialSchema),
  asyncHandler(async (req, res) => {
    const material = await prisma.material.create({
      data: {
        name: req.body.name,
        unit: req.body.unit || null,
        price: req.body.price ?? null,
        stock: req.body.stock ?? 0,
      },
    });
    res.status(201).json(material);
  }),
);

router.patch(
  '/:id',
  validate(materialSchema.partial()),
  asyncHandler(async (req, res) => {
    const material = await prisma.material.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        unit: req.body.unit,
        price: req.body.price,
        stock: req.body.stock,
      },
    });
    res.json(material);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.material.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  }),
);

export default router;
