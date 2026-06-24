import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler, HttpError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  materialId: z.number().int(),
  quantity: z.number().int().min(1),
});

const updateSchema = z.object({
  status: z.enum(['Requested', 'Ordered', 'Received']),
});

router.post(
  '/orders/:orderId/material-requests',
  requireRole('Master', 'Admin'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const orderId = Number(req.params.orderId);
    const material = await prisma.material.findUnique({ where: { id: req.body.materialId } });
    if (!material) throw new HttpError(404, 'Материал не найден');

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.materialRequest.create({
        data: {
          orderId,
          masterId: req.user!.sub,
          materialId: req.body.materialId,
          quantity: req.body.quantity,
        },
        include: { material: true },
      });
      await tx.order.update({ where: { id: orderId }, data: { status: 'AwaitingParts' } });
      return request;
    });
    res.status(201).json(result);
  }),
);

router.get(
  '/material-requests',
  requireRole('Manager', 'Admin'),
  asyncHandler(async (req, res) => {
    const status = req.query.status as any;
    const requests = await prisma.materialRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        material: true,
        master: { select: { id: true, fullName: true } },
        order: { select: { id: true, deviceInfo: true } },
      },
      orderBy: { id: 'desc' },
    });
    res.json(requests);
  }),
);

router.patch(
  '/material-requests/:id',
  requireRole('Manager', 'Admin'),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.materialRequest.findUnique({ where: { id } });
      if (!current) throw new HttpError(404, 'Заявка не найдена');

      const becomingReceived =
        req.body.status === 'Received' && current.status !== 'Received';

      const updated = await tx.materialRequest.update({
        where: { id },
        data: { status: req.body.status, managerId: req.user!.sub },
        include: { material: true },
      });

      if (becomingReceived) {
        await tx.material.update({
          where: { id: current.materialId },
          data: { stock: { increment: current.quantity } },
        });
        const pending = await tx.materialRequest.count({
          where: { orderId: current.orderId, status: { not: 'Received' } },
        });
        if (pending === 0) {
          const order = await tx.order.findUnique({ where: { id: current.orderId } });
          if (order && order.status === 'AwaitingParts') {
            await tx.order.update({
              where: { id: current.orderId },
              data: { status: 'InProgress' },
            });
          }
        }
      }
      return updated;
    });
    res.json(result);
  }),
);

export default router;
