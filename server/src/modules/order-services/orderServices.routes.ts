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
  serviceId: z.number().int(),
  comment: z.string().max(2000).optional(),
});

const updateSchema = z.object({
  status: z.enum(['Planned', 'Done']).optional(),
  actualPrice: z.number().min(0).nullable().optional(),
  comment: z.string().max(2000).optional(),
});

router.post(
  '/orders/:orderId/services',
  validate(addSchema),
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.orderId);
    const service = await prisma.service.findUnique({ where: { id: req.body.serviceId } });
    if (!service) throw new HttpError(404, 'Услуга не найдена');
    const created = await prisma.orderService.create({
      data: {
        orderId,
        serviceId: req.body.serviceId,
        comment: req.body.comment || null,
        actualPrice: service.basePrice,
      },
      include: { service: true },
    });
    res.status(201).json(created);
  }),
);

router.patch(
  '/order-services/:id',
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const updated = await prisma.orderService.update({
      where: { id: Number(req.params.id) },
      data: {
        status: req.body.status,
        actualPrice: req.body.actualPrice,
        comment: req.body.comment,
      },
      include: { service: true },
    });
    res.json(updated);
  }),
);

router.delete(
  '/order-services/:id',
  asyncHandler(async (req, res) => {
    await prisma.orderService.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  }),
);

export default router;
