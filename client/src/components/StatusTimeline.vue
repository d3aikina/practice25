<script setup lang="ts">
import { computed } from 'vue';
import type { OrderStatus } from '@/types';
import { orderStatusFlow, orderStatusLabels } from '@/lib/labels';
import { Check } from 'lucide-vue-next';

const props = defineProps<{ status: OrderStatus }>();

// Отменённый заказ показываем отдельной веткой
const isCancelled = computed(() => props.status === 'Cancelled');

const currentIndex = computed(() => {
  // AwaitingParts отображаем на позиции InProgress
  const map: Partial<Record<OrderStatus, OrderStatus>> = { AwaitingParts: 'InProgress' };
  const effective = map[props.status] ?? props.status;
  return orderStatusFlow.indexOf(effective);
});
</script>

<template>
  <div v-if="isCancelled" class="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white">✕</span>
    <span class="font-medium">Заказ отменён — выдан без ремонта</span>
  </div>

  <ol v-else class="flex flex-wrap items-center gap-y-4">
    <li v-for="(s, i) in orderStatusFlow" :key="s" class="flex items-center">
      <div class="flex flex-col items-center gap-1.5">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition"
          :class="
            i < currentIndex
              ? 'border-brand-600 bg-brand-600 text-white'
              : i === currentIndex
                ? 'border-brand-600 bg-white text-brand-600 ring-4 ring-brand-100'
                : 'border-slate-200 bg-white text-slate-300'
          "
        >
          <Check v-if="i < currentIndex" class="h-4 w-4" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span
          class="max-w-[88px] text-center text-[11px] leading-tight"
          :class="i <= currentIndex ? 'font-semibold text-slate-700' : 'text-slate-400'"
        >
          {{ orderStatusLabels[s] }}
        </span>
      </div>
      <div
        v-if="i < orderStatusFlow.length - 1"
        class="mx-1 h-0.5 w-8 rounded transition sm:w-12"
        :class="i < currentIndex ? 'bg-brand-600' : 'bg-slate-200'"
      />
    </li>
  </ol>
</template>
