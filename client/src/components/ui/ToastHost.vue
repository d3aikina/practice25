<script setup lang="ts">
import { useToastStore } from '@/stores/toast';
import { CheckCircle2, XCircle, Info } from 'lucide-vue-next';

const toast = useToastStore();
const icons = { success: CheckCircle2, error: XCircle, info: Info };
const tones = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
};
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
    <TransitionGroup name="list">
      <div
        v-for="t in toast.toasts"
        :key="t.id"
        class="flex items-start gap-3 rounded-xl border px-4 py-3 shadow-soft backdrop-blur"
        :class="tones[t.type]"
      >
        <component :is="icons[t.type]" class="mt-0.5 h-5 w-5 shrink-0" />
        <p class="flex-1 text-sm font-medium">{{ t.message }}</p>
        <button class="text-current/60 hover:text-current" @click="toast.dismiss(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>
