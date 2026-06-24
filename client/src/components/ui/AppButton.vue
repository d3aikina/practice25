<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
    block?: boolean;
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
);

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-green-500 text-white hover:bg-green-600',
};
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm' };

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.97]',
  'disabled:cursor-not-allowed disabled:opacity-50',
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : '',
]);
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <slot />
  </button>
</template>
