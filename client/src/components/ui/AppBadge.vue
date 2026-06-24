<script setup lang="ts">
defineProps<{ tone?: string }>();
const tones: Record<string, string> = {
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-brand-100 text-brand-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  violet: 'bg-violet-100 text-violet-700',
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="tones[tone ?? 'gray']"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    <slot />
  </span>
</template>
