<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { http } from '@/api/http';
import type { Order } from '@/types';
import { orderStatusLabels, serviceStatusLabels, formatMoney, formatDate } from '@/lib/labels';

const route = useRoute();
const order = ref<Order | null>(null);
const totals = ref<{ servicesTotal: number; materialsTotal: number; total: number } | null>(null);

const usedMaterials = computed(() => order.value?.materials.filter((m) => (m.quantityUsed ?? 0) > 0) ?? []);

function print() {
  window.print();
}

onMounted(async () => {
  const { data } = await http.get(`/orders/${route.params.id}/estimate`);
  order.value = data.order;
  totals.value = data.totals;
  setTimeout(() => window.print(), 400);
});
</script>

<template>
  <div v-if="order" class="mx-auto max-w-2xl bg-white p-10 text-slate-800">
    <div class="mb-8 flex items-start justify-between border-b border-slate-200 pb-6">
      <div>
        <h1 class="text-2xl font-bold text-brand-700">РемСервис</h1>
        <p class="text-sm text-slate-400">Сервисный центр по ремонту техники</p>
      </div>
      <div class="text-right text-sm">
        <p class="font-semibold">Смета №{{ order.id }}</p>
        <p class="text-slate-400">{{ formatDate(order.createdAt) }}</p>
        <p class="text-slate-400">Статус: {{ orderStatusLabels[order.status] }}</p>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-6 text-sm">
      <div>
        <p class="mb-1 font-semibold text-slate-500">Клиент</p>
        <p>{{ order.client?.fullName }}</p>
        <p class="text-slate-400">{{ order.client?.phone }}</p>
      </div>
      <div>
        <p class="mb-1 font-semibold text-slate-500">Устройство</p>
        <p>{{ order.deviceInfo }}</p>
        <p class="text-slate-400">{{ order.defectDescription }}</p>
      </div>
    </div>

    <table class="mb-6 w-full text-sm">
      <thead>
        <tr class="border-b-2 border-slate-200 text-left text-xs uppercase text-slate-400">
          <th class="py-2">Услуга / работа</th>
          <th class="py-2 text-center">Статус</th>
          <th class="py-2 text-right">Стоимость</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in order.services" :key="s.id" class="border-b border-slate-100">
          <td class="py-2">{{ s.service.name }}</td>
          <td class="py-2 text-center text-slate-400">{{ serviceStatusLabels[s.status] }}</td>
          <td class="py-2 text-right">{{ formatMoney(s.actualPrice ?? s.service.basePrice) }}</td>
        </tr>
      </tbody>
    </table>

    <table v-if="usedMaterials.length" class="mb-6 w-full text-sm">
      <thead>
        <tr class="border-b-2 border-slate-200 text-left text-xs uppercase text-slate-400">
          <th class="py-2">Материал</th>
          <th class="py-2 text-center">Кол-во</th>
          <th class="py-2 text-right">Сумма</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in usedMaterials" :key="m.id" class="border-b border-slate-100">
          <td class="py-2">{{ m.material.name }}</td>
          <td class="py-2 text-center">{{ m.quantityUsed }} {{ m.material.unit }}</td>
          <td class="py-2 text-right">{{ formatMoney(Number(m.material.price ?? 0) * (m.quantityUsed ?? 0)) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="ml-auto w-64 space-y-1 text-sm">
      <div class="flex justify-between text-slate-500"><span>Услуги</span><span>{{ formatMoney(totals?.servicesTotal) }}</span></div>
      <div class="flex justify-between text-slate-500"><span>Материалы</span><span>{{ formatMoney(totals?.materialsTotal) }}</span></div>
      <div class="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
        <span>Итого</span><span class="text-brand-700">{{ formatMoney(totals?.total) }}</span>
      </div>
    </div>

    <div class="mt-12 flex justify-between text-sm text-slate-400">
      <div>
        <p class="mb-8">Мастер: {{ order.master?.fullName ?? '____________' }}</p>
        <p>Подпись: ____________</p>
      </div>
      <div>
        <p class="mb-8">Клиент: {{ order.client?.fullName }}</p>
        <p>Подпись: ____________</p>
      </div>
    </div>

    <button
      class="no-print mt-10 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white"
      @click="print"
    >
      Печать
    </button>
  </div>
</template>
