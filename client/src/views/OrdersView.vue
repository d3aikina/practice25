<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import type { Order, OrderStatus } from '@/types';
import { orderStatusLabels } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import OrderCard from '@/components/OrderCard.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import AppButton from '@/components/ui/AppButton.vue';
import CreateOrderModal from '@/components/manager/CreateOrderModal.vue';
import { Plus, ClipboardList } from 'lucide-vue-next';

const auth = useAuthStore();
const orders = ref<Order[]>([]);
const loading = ref(true);
const statusFilter = ref<OrderStatus | ''>('');
const showCreate = ref(false);

const isManager = computed(() => auth.role === 'Manager');

const title = computed(() => (auth.role === 'Client' ? 'Мои заказы' : auth.role === 'Master' ? 'Мои заказы' : 'Заказы'));

const filtered = computed(() =>
  statusFilter.value ? orders.value.filter((o) => o.status === statusFilter.value) : orders.value,
);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/orders');
    orders.value = data;
  } finally {
    loading.value = false;
  }
}

const statuses = Object.keys(orderStatusLabels) as OrderStatus[];

onMounted(load);
</script>

<template>
  <div>
    <PageHeader :title="title" :subtitle="auth.role === 'Client' ? 'Отслеживайте статус ремонта вашей техники' : 'Все заказы мастерской'">
      <template #actions>
        <AppButton v-if="isManager" @click="showCreate = true">
          <Plus class="h-4 w-4" /> Новый заказ
        </AppButton>
      </template>
    </PageHeader>

    <div v-if="isManager && !loading" class="mb-4 flex flex-wrap gap-2">
      <button
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="statusFilter === '' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'"
        @click="statusFilter = ''"
      >
        Все
      </button>
      <button
        v-for="s in statuses"
        :key="s"
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'"
        @click="statusFilter = s"
      >
        {{ orderStatusLabels[s] }}
      </button>
    </div>

    <SkeletonList v-if="loading" />

    <EmptyState
      v-else-if="!filtered.length"
      title="Заказов пока нет"
      :subtitle="isManager ? 'Создайте первый заказ для клиента' : 'Здесь появятся ваши заказы'"
    >
      <template #icon><ClipboardList class="h-8 w-8" /></template>
      <template #action>
        <AppButton v-if="isManager" @click="showCreate = true"><Plus class="h-4 w-4" /> Новый заказ</AppButton>
      </template>
    </EmptyState>

    <TransitionGroup v-else name="list" tag="div" class="space-y-3">
      <OrderCard v-for="o in filtered" :key="o.id" :order="o" />
    </TransitionGroup>

    <CreateOrderModal v-model="showCreate" @created="load" />
  </div>
</template>
