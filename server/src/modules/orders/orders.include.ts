import type { Prisma } from '@prisma/client';

const userSelect = {
  select: { id: true, fullName: true, phone: true, email: true, role: true },
};

export const orderInclude = {
  client: userSelect,
  manager: userSelect,
  master: userSelect,
  services: { include: { service: true }, orderBy: { id: 'asc' } },
  materials: { include: { material: true }, orderBy: { id: 'asc' } },
  materialRequests: {
    include: { material: true, master: userSelect },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.OrderInclude;
