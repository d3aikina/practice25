import { Router } from 'express';
import { z } from 'zod';
import type { OrderStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { asyncHandler, HttpError } from '../../middleware/errorHandler';
import { orderInclude } from './orders.include';

const router = Router();
router.use(authenticate);

const createOrderSchema = z.object({
  clientId: z.number().int(),
  deviceInfo: z.string().min(1).max(255),
  defectDescription: z.string().min(1),
});

const estimateSchema = z.object({
  estimatedCost: z.number().min(0),
});

const completeSchema = z.object({
  finalCost: z.number().min(0),
});

const statusSchema = z.object({
  status: z.enum([
    'Created',
    'Diagnostics',
    'AwaitingConfirmation',
    'AwaitingParts',
    'InProgress',
    'Cancelled',
    'AwaitingPickup',
    'Completed',
  ]),
});

function calcTotals(order: any) {
  const servicesTotal = order.services.reduce((sum: number, os: any) => {
    const price = os.actualPrice ?? os.service.basePrice ?? 0;
    return sum + Number(price);
  }, 0);
  const materialsTotal = order.materials.reduce((sum: number, om: any) => {
    const qty = om.quantityUsed ?? om.quantityPlanned ?? 0;
    const price = om.material.price ?? 0;
    return sum + Number(price) * qty;
  }, 0);
  return { servicesTotal, materialsTotal, total: servicesTotal + materialsTotal };
}

async function loadOrder(id: number) {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) throw new HttpError(404, 'Заказ не найден');
  return order;
}

function hideStockForClient(order: any) {
  for (const om of order.materials ?? []) {
    if (om.material) delete om.material.stock;
  }
  for (const mr of order.materialRequests ?? []) {
    if (mr.material) delete mr.material.stock;
  }
  return order;
}

router.post(
  '/',
  requireRole('Manager', 'Admin'),
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const { clientId, deviceInfo, defectDescription } = req.body;
    const client = await prisma.user.findFirst({ where: { id: clientId, role: 'Client' } });
    if (!client) throw new HttpError(404, 'Клиент не найден');
    const order = await prisma.order.create({
      data: {
        clientId,
        managerId: req.user!.sub,
        deviceInfo,
        defectDescription,
        status: 'Created',
      },
      include: orderInclude,
    });
    res.status(201).json(order);
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { sub, role } = req.user!;
    let where: any = {};
    if (role === 'Client') where = { clientId: sub };
    else if (role === 'Master') where = { masterId: sub };

    const status = req.query.status as OrderStatus | undefined;
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(role === 'Client' ? orders.map(hideStockForClient) : orders);
  }),
);

router.get(
  '/free',
  requireRole('Master', 'Admin'),
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      where: { masterId: null, status: 'Created' },
      include: orderInclude,
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { sub, role } = req.user!;
    const order = await loadOrder(Number(req.params.id));
    if (role === 'Client' && order.clientId !== sub) throw new HttpError(403, 'Нет доступа');
    if (role === 'Master' && order.masterId !== sub && order.masterId !== null) {
      throw new HttpError(403, 'Нет доступа');
    }
    const totals = calcTotals(order);
    res.json({ ...(role === 'Client' ? hideStockForClient(order) : order), totals });
  }),
);

router.post(
  '/:id/take',
  requireRole('Master'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Заказ не найден');
    if (order.masterId) throw new HttpError(409, 'Заказ уже закреплён за мастером');
    if (order.status !== 'Created') throw new HttpError(409, 'Заказ нельзя взять в работу');
    const updated = await prisma.order.update({
      where: { id },
      data: { masterId: req.user!.sub, status: 'Diagnostics' },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.patch(
  '/:id/estimate',
  requireRole('Manager', 'Admin'),
  validate(estimateSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.order.update({
      where: { id },
      data: { estimatedCost: req.body.estimatedCost, status: 'AwaitingConfirmation' },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.post(
  '/:id/confirm',
  requireRole('Manager', 'Admin'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new HttpError(404, 'Заказ не найден');
    if (order.status !== 'AwaitingConfirmation') {
      throw new HttpError(409, 'Заказ не ожидает подтверждения');
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'InProgress' },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.post(
  '/:id/reject',
  requireRole('Manager', 'Admin'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'Cancelled', completedAt: new Date() },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.post(
  '/:id/ready',
  requireRole('Manager', 'Master', 'Admin'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'AwaitingPickup' },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.post(
  '/:id/complete',
  requireRole('Manager', 'Admin'),
  validate(completeSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'Completed', finalCost: req.body.finalCost, completedAt: new Date() },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.patch(
  '/:id/status',
  requireRole('Manager', 'Admin'),
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.order.update({
      where: { id },
      data: { status: req.body.status },
      include: orderInclude,
    });
    res.json(updated);
  }),
);

router.get(
  '/:id/estimate',
  asyncHandler(async (req, res) => {
    const order = await loadOrder(Number(req.params.id));
    res.json({ order, totals: calcTotals(order) });
  }),
);

export default router;
