<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { Material } from '@/types';
import { formatMoney } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { Boxes, Plus, Minus } from 'lucide-vue-next';

const toast = useToastStore();
const materials = ref<Material[]>([]);
const loading = ref(true);
const deltas = ref<Record<number, number>>({});

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/materials');
    materials.value = data;
    materials.value.forEach((m) => (deltas.value[m.id] = 1));
  } finally {
    loading.value = false;
  }
}

async function applyDelta(m: Material, sign: number) {
  const delta = (deltas.value[m.id] || 0) * sign;
  if (!delta) return;
  try {
    await http.patch(`/materials/${m.id}/stock`, { delta });
    toast.success(`Склад обновлён: ${m.name}`);
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  }
}

onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Склад и поставки" subtitle="Фиксируйте приход материалов на склад" />

    <SkeletonList v-if="loading" />
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div v-for="m in materials" :key="m.id" class="card flex items-center gap-4 p-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          <Boxes class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-slate-700">{{ m.name }}</p>
          <p class="text-xs text-slate-400">{{ formatMoney(m.price) }} · на складе: <b>{{ m.stock }}</b> {{ m.unit }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <input v-model.number="deltas[m.id]" type="number" min="1" class="input w-16 px-2 py-1.5 text-center text-sm" />
          <button class="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100" title="Приход" @click="applyDelta(m, 1)">
            <Plus class="h-4 w-4" />
          </button>
          <button class="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Списание" @click="applyDelta(m, -1)">
            <Minus class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
