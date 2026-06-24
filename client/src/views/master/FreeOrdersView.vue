<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { Order } from '@/types';
import { formatDate } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { Smartphone, Wrench, PackageSearch } from 'lucide-vue-next';

const router = useRouter();
const toast = useToastStore();
const orders = ref<Order[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/orders/free');
    orders.value = data;
  } finally {
    loading.value = false;
  }
}

async function take(o: Order) {
  try {
    await http.post(`/orders/${o.id}/take`);
    toast.success('Заказ закреплён за вами');
    router.push(`/orders/${o.id}`);
  } catch (e) {
    toast.error(errorMessage(e));
  }
}

onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Свободные заказы" subtitle="Возьмите заказ на диагностику — он закрепится за вами" />

    <SkeletonList v-if="loading" />
    <EmptyState v-else-if="!orders.length" title="Свободных заказов нет" subtitle="Все заказы уже в работе">
      <template #icon><PackageSearch class="h-8 w-8" /></template>
    </EmptyState>

    <TransitionGroup v-else name="list" tag="div" class="grid gap-4 sm:grid-cols-2">
      <div v-for="o in orders" :key="o.id" class="card flex flex-col p-5">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
            <Smartphone class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-slate-800">№{{ o.id }} · {{ o.deviceInfo }}</p>
            <p class="mt-0.5 line-clamp-2 text-sm text-slate-500">{{ o.defectDescription }}</p>
            <p class="mt-1 text-xs text-slate-400">{{ formatDate(o.createdAt) }}</p>
          </div>
        </div>
        <AppButton class="mt-4" block @click="take(o)"><Wrench class="h-4 w-4" /> Взять на диагностику</AppButton>
      </div>
    </TransitionGroup>
  </div>
</template>
