<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';
defineProps<{ title?: string; subtitle?: string }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-400">
      <slot name="icon"><Inbox class="h-8 w-8" /></slot>
    </div>
    <h3 class="text-base font-semibold text-slate-700">{{ title ?? 'Пусто' }}</h3>
    <p v-if="subtitle" class="mt-1 max-w-sm text-sm text-slate-400">{{ subtitle }}</p>
    <div class="mt-4"><slot name="action" /></div>
  </div>
</template>
