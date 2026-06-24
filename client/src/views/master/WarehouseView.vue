<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http } from '@/api/http';
import type { Material } from '@/types';
import { formatMoney } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import { Boxes } from 'lucide-vue-next';

const materials = ref<Material[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/materials');
    materials.value = data;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Склад материалов" subtitle="Наличие материалов на складе" />
    <SkeletonList v-if="loading" />
    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-5 py-3 font-medium">Материал</th>
            <th class="px-5 py-3 font-medium">Цена</th>
            <th class="px-5 py-3 text-right font-medium">На складе</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="m in materials" :key="m.id" class="transition hover:bg-slate-50/60">
            <td class="px-5 py-3">
              <div class="flex items-center gap-2.5">
                <Boxes class="h-4 w-4 text-brand-400" />
                <span class="font-medium text-slate-700">{{ m.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-slate-500">{{ formatMoney(m.price) }}</td>
            <td class="px-5 py-3 text-right">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="m.stock > 5 ? 'bg-green-100 text-green-700' : m.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'"
              >
                {{ m.stock }} {{ m.unit }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
