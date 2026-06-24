<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Order } from '@/types';
import { orderStatusLabels, orderStatusTone, formatMoney, formatDate } from '@/lib/labels';
import AppBadge from '@/components/ui/AppBadge.vue';
import { Smartphone, User, ChevronRight } from 'lucide-vue-next';

defineProps<{ order: Order }>();
</script>

<template>
  <RouterLink
    :to="`/orders/${order.id}`"
    class="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
  >
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
      <Smartphone class="h-6 w-6" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-slate-800">№{{ order.id }}</span>
        <span class="truncate text-sm text-slate-600">{{ order.deviceInfo }}</span>
      </div>
      <p class="mt-0.5 line-clamp-1 text-xs text-slate-400">{{ order.defectDescription }}</p>
      <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        <span v-if="order.client" class="inline-flex items-center gap-1">
          <User class="h-3.5 w-3.5" />{{ order.client.fullName }}
        </span>
        <span>{{ formatDate(order.createdAt) }}</span>
        <span v-if="order.estimatedCost" class="font-medium text-slate-500">
          ≈ {{ formatMoney(order.estimatedCost) }}
        </span>
      </div>
    </div>

    <AppBadge :tone="orderStatusTone[order.status]">{{ orderStatusLabels[order.status] }}</AppBadge>
    <ChevronRight class="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-400" />
  </RouterLink>
</template>
