import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler, HttpError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate, requireRole('Master', 'Manager', 'Admin'));

const addSchema = z.object({
  materialId: z.number().int(),
  quantityPlanned: z.number().int().min(0).default(1),
});

const updateSchema = z.object({
  quantityPlanned: z.number().int().min(0).optional(),
  quantityUsed: z.number().int().min(0).optional(),
});

router.post(
  '/orders/:orderId/materials',
  validate(addSchema),
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.orderId);
    const material = await prisma.material.findUnique({ where: { id: req.body.materialId } });
    if (!material) throw new HttpError(404, 'Материал не найден');
    const created = await prisma.orderMaterial.create({
      data: {
        orderId,
        materialId: req.body.materialId,
        quantityPlanned: req.body.quantityPlanned,
      },
      include: { material: true },
    });
    res.status(201).json(created);
  }),
);

router.patch(
  '/order-materials/:id',
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.orderMaterial.findUnique({ where: { id } });
      if (!current) throw new HttpError(404, 'Позиция не найдена');

      const data: any = {};
      if (req.body.quantityPlanned !== undefined) data.quantityPlanned = req.body.quantityPlanned;

      if (req.body.quantityUsed !== undefined) {
        const prevUsed = current.quantityUsed ?? 0;
        const delta = req.body.quantityUsed - prevUsed; // >0 — списать со склада
        if (delta !== 0) {
          const material = await tx.material.findUnique({ where: { id: current.materialId } });
          if (!material) throw new HttpError(404, 'Материал не найден');
          if (material.stock - delta < 0) {
            throw new HttpError(409, 'Недостаточно материала на складе');
          }
          await tx.material.update({
            where: { id: current.materialId },
            data: { stock: { decrement: delta } },
          });
        }
        data.quantityUsed = req.body.quantityUsed;
      }

      return tx.orderMaterial.update({ where: { id }, data, include: { material: true } });
    });
    res.json(result);
  }),
);

router.delete(
  '/order-materials/:id',
  asyncHandler(async (req, res) => {
    await prisma.orderMaterial.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  }),
);

export default router;
