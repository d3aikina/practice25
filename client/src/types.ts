export type Role = 'Client' | 'Manager' | 'Master' | 'Admin';

export type OrderStatus =
  | 'Created'
  | 'Diagnostics'
  | 'AwaitingConfirmation'
  | 'AwaitingParts'
  | 'InProgress'
  | 'Cancelled'
  | 'AwaitingPickup'
  | 'Completed';

export type OrderServiceStatus = 'Planned' | 'Done';
export type MaterialRequestStatus = 'Requested' | 'Ordered' | 'Received';

export interface User {
  id: number;
  role: Role;
  login: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  hasCredentials: boolean;
}

export interface Service {
  id: number;
  name: string;
  basePrice: string | number | null;
  description: string | null;
}

export interface Material {
  id: number;
  name: string;
  unit: string | null;
  price: string | number | null;
  stock: number;
}

export interface OrderServiceItem {
  id: number;
  orderId: number;
  serviceId: number;
  status: OrderServiceStatus;
  actualPrice: string | number | null;
  comment: string | null;
  service: Service;
}

export interface OrderMaterialItem {
  id: number;
  orderId: number;
  materialId: number;
  quantityPlanned: number | null;
  quantityUsed: number | null;
  material: Material;
}

export interface MaterialRequestItem {
  id: number;
  orderId: number;
  masterId: number;
  materialId: number;
  quantity: number;
  status: MaterialRequestStatus;
  managerId: number | null;
  material: Material;
  master?: { id: number; fullName: string | null };
  order?: { id: number; deviceInfo: string | null };
}

export interface OrderUser {
  id: number;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  role: Role;
}

export interface Order {
  id: number;
  clientId: number;
  managerId: number | null;
  masterId: number | null;
  deviceInfo: string | null;
  defectDescription: string | null;
  status: OrderStatus;
  estimatedCost: string | number | null;
  finalCost: string | number | null;
  createdAt: string;
  completedAt: string | null;
  client?: OrderUser;
  manager?: OrderUser | null;
  master?: OrderUser | null;
  services: OrderServiceItem[];
  materials: OrderMaterialItem[];
  materialRequests: MaterialRequestItem[];
  totals?: { servicesTotal: number; materialsTotal: number; total: number };
}
