<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { MaterialRequestItem } from '@/types';
import { materialRequestStatusLabels, materialRequestStatusTone } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import AppBadge from '@/components/ui/AppBadge.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { ListChecks } from 'lucide-vue-next';

const toast = useToastStore();
const requests = ref<MaterialRequestItem[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/material-requests');
    requests.value = data;
  } finally {
    loading.value = false;
  }
}

async function update(r: MaterialRequestItem, status: string) {
  try {
    await http.patch(`/material-requests/${r.id}`, { status });
    toast.success('Статус обновлён, склад пополнен');
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  }
}

onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Заявки на материалы" subtitle="Заказывайте недостающие материалы по заявкам мастеров" />

    <SkeletonList v-if="loading" />
    <EmptyState v-else-if="!requests.length" title="Заявок нет" subtitle="Мастера ещё не запрашивали материалы">
      <template #icon><ListChecks class="h-8 w-8" /></template>
    </EmptyState>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-5 py-3 font-medium">Материал</th>
            <th class="px-5 py-3 font-medium">Кол-во</th>
            <th class="px-5 py-3 font-medium">Заказ</th>
            <th class="px-5 py-3 font-medium">Мастер</th>
            <th class="px-5 py-3 font-medium">Статус</th>
            <th class="px-5 py-3 text-right font-medium">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="r in requests" :key="r.id" class="transition hover:bg-slate-50/60">
            <td class="px-5 py-3 font-medium text-slate-700">{{ r.material.name }}</td>
            <td class="px-5 py-3 text-slate-500">{{ r.quantity }} {{ r.material.unit }}</td>
            <td class="px-5 py-3">
              <RouterLink :to="`/orders/${r.orderId}`" class="text-brand-600 hover:underline">№{{ r.orderId }}</RouterLink>
            </td>
            <td class="px-5 py-3 text-slate-500">{{ r.master?.fullName ?? '—' }}</td>
            <td class="px-5 py-3">
              <AppBadge :tone="materialRequestStatusTone[r.status]">{{ materialRequestStatusLabels[r.status] }}</AppBadge>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-1">
                <AppButton v-if="r.status === 'Requested'" size="sm" variant="secondary" @click="update(r, 'Ordered')">Заказать</AppButton>
                <AppButton v-if="r.status !== 'Received'" size="sm" variant="success" @click="update(r, 'Received')">Получено</AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
