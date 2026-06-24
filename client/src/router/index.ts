import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Role } from '@/types';

import AuthLayout from '@/layouts/AuthLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [
      { path: '', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guestOnly: true } },
      { path: 'phone', name: 'phone-login', component: () => import('@/views/auth/PhoneLoginView.vue'), meta: { guestOnly: true } },
      { path: 'set-credentials', name: 'set-credentials', component: () => import('@/views/auth/SetCredentialsView.vue'), meta: { auth: true } },
    ],
  },
  // Печатная смета — отдельно, без оболочки дашборда
  {
    path: '/orders/:id/print',
    name: 'estimate-print',
    component: () => import('@/views/EstimatePrintView.vue'),
    meta: { auth: true },
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { auth: true },
    children: [
      { path: '', redirect: '/orders' },
      { path: 'orders', name: 'orders', component: () => import('@/views/OrdersView.vue') },
      { path: 'orders/free', name: 'free-orders', component: () => import('@/views/master/FreeOrdersView.vue'), meta: { roles: ['Master'] } },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/OrderDetailView.vue') },
      { path: 'material-requests', name: 'material-requests', component: () => import('@/views/manager/MaterialRequestsView.vue'), meta: { roles: ['Manager', 'Admin'] } },
      { path: 'deliveries', name: 'deliveries', component: () => import('@/views/manager/DeliveriesView.vue'), meta: { roles: ['Manager', 'Admin'] } },
      { path: 'warehouse', name: 'warehouse', component: () => import('@/views/master/WarehouseView.vue'), meta: { roles: ['Master'] } },
      { path: 'admin/users', name: 'admin-users', component: () => import('@/views/admin/UsersView.vue'), meta: { roles: ['Admin'] } },
      { path: 'admin/services', name: 'admin-services', component: () => import('@/views/admin/ServicesView.vue'), meta: { roles: ['Admin'] } },
      { path: 'admin/materials', name: 'admin-materials', component: () => import('@/views/admin/MaterialsView.vue'), meta: { roles: ['Admin'] } },
      { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Подгружаем профиль при наличии токена, но без данных пользователя
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
    }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) return { path: '/' };
  if (to.meta.auth && !auth.isAuthenticated) return { name: 'login' };

  // Стартовая страница администратора
  if (to.path === '/orders' && auth.role === 'Admin') return { path: '/admin/users' };

  // Ограничение по ролям
  const roles = to.meta.roles as Role[] | undefined;
  if (roles && auth.role && !roles.includes(auth.role)) {
    return { path: '/' };
  }
  return true;
});
