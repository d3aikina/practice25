<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{ modelValue: boolean; title?: string }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<template>
  <Teleport to="body">
    <Transition name="page">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 flex items-center justify-center p-4"
        @click.self="emit('update:modelValue', false)"
      >
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <div class="card relative z-10 w-full max-w-lg animate-scale-in p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
            <button
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              @click="emit('update:modelValue', false)"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
