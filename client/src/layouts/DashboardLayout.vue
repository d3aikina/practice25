<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { roleLabels } from '@/lib/labels';
import {
  Wrench,
  ClipboardList,
  PackageSearch,
  Boxes,
  Users,
  ListChecks,
  Truck,
  Wrench as WrenchIcon,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();
const mobileOpen = ref(false);

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

const nav = computed<NavItem[]>(() => {
  switch (auth.role) {
    case 'Client':
      return [{ to: '/orders', label: 'Мои заказы', icon: ClipboardList }];
    case 'Manager':
      return [
        { to: '/orders', label: 'Заказы', icon: ClipboardList },
        { to: '/material-requests', label: 'Заявки на материалы', icon: ListChecks },
        { to: '/deliveries', label: 'Склад и поставки', icon: Truck },
      ];
    case 'Master':
      return [
        { to: '/orders/free', label: 'Свободные заказы', icon: PackageSearch },
        { to: '/orders', label: 'Мои заказы', icon: WrenchIcon },
        { to: '/warehouse', label: 'Склад', icon: Boxes },
      ];
    case 'Admin':
      return [
        { to: '/admin/users', label: 'Пользователи', icon: Users },
        { to: '/admin/services', label: 'Услуги', icon: ListChecks },
        { to: '/admin/materials', label: 'Материалы', icon: Boxes },
      ];
    default:
      return [];
  }
});

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-100 bg-white transition-transform lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between px-6 py-5">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wrench class="h-5 w-5" />
          </div>
          <span class="text-lg font-bold text-slate-800">РемСервис</span>
        </div>
        <button class="lg:hidden" @click="mobileOpen = false"><X class="h-5 w-5 text-slate-400" /></button>
      </div>

      <nav class="flex-1 space-y-1 px-3">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          active-class="!bg-brand-50 !text-brand-700"
          @click="mobileOpen = false"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-slate-100 p-3">
        <RouterLink
          to="/profile"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          active-class="!bg-brand-50 !text-brand-700"
        >
          <UserCircle class="h-5 w-5" />
          Профиль
        </RouterLink>
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
          @click="logout"
        >
          <LogOut class="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>

    <!-- Overlay для мобилки -->
    <div v-if="mobileOpen" class="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" @click="mobileOpen = false" />

    <!-- Контент -->
    <div class="lg:pl-64">
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 px-6 py-3.5 backdrop-blur">
        <button class="lg:hidden" @click="mobileOpen = true"><Menu class="h-6 w-6 text-slate-600" /></button>
        <div class="hidden lg:block" />
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-700">{{ auth.user?.fullName ?? 'Пользователь' }}</p>
            <p class="text-xs text-slate-400">{{ auth.role ? roleLabels[auth.role] : '' }}</p>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
            {{ (auth.user?.fullName ?? '?').charAt(0) }}
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-6 py-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
