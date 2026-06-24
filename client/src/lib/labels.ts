import type { OrderStatus, OrderServiceStatus, MaterialRequestStatus, Role } from '@/types';

type BadgeTone = 'gray' | 'blue' | 'indigo' | 'amber' | 'green' | 'red' | 'violet';

export const orderStatusLabels: Record<OrderStatus, string> = {
  Created: 'Создан',
  Diagnostics: 'Диагностика',
  AwaitingConfirmation: 'Ожидает подтверждения',
  AwaitingParts: 'Ожидание запчастей',
  InProgress: 'В работе',
  Cancelled: 'Отменён',
  AwaitingPickup: 'Ожидает получения',
  Completed: 'Завершён',
};

export const orderStatusTone: Record<OrderStatus, BadgeTone> = {
  Created: 'gray',
  Diagnostics: 'blue',
  AwaitingConfirmation: 'amber',
  AwaitingParts: 'violet',
  InProgress: 'indigo',
  Cancelled: 'red',
  AwaitingPickup: 'amber',
  Completed: 'green',
};

// Порядок статусов для таймлайна (без терминальной отмены)
export const orderStatusFlow: OrderStatus[] = [
  'Created',
  'Diagnostics',
  'AwaitingConfirmation',
  'InProgress',
  'AwaitingPickup',
  'Completed',
];

export const serviceStatusLabels: Record<OrderServiceStatus, string> = {
  Planned: 'Запланировано',
  Done: 'Выполнено',
};

export const materialRequestStatusLabels: Record<MaterialRequestStatus, string> = {
  Requested: 'Запрошено',
  Ordered: 'Заказано',
  Received: 'Получено',
};

export const materialRequestStatusTone: Record<MaterialRequestStatus, BadgeTone> = {
  Requested: 'amber',
  Ordered: 'blue',
  Received: 'green',
};

export const roleLabels: Record<Role, string> = {
  Client: 'Клиент',
  Manager: 'Менеджер',
  Master: 'Мастер',
  Admin: 'Администратор',
};

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const num = typeof value === 'string' ? Number(value) : value;
  return num.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
