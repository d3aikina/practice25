import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let counter = 0;

  function push(message: string, type: ToastType = 'info') {
    const id = ++counter;
    toasts.value.push({ id, message, type });
    setTimeout(() => dismiss(id), 3500);
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  const success = (m: string) => push(m, 'success');
  const error = (m: string) => push(m, 'error');
  const info = (m: string) => push(m, 'info');

  return { toasts, push, dismiss, success, error, info };
});
