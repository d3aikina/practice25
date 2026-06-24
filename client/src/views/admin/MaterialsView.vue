<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { Material } from '@/types';
import { formatMoney } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppModal from '@/components/ui/AppModal.vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';

const toast = useToastStore();
const items = ref<Material[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref<Material | null>(null);
const form = ref<any>({ name: '', unit: 'шт', price: 0, stock: 0 });
const saving = ref(false);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/materials');
    items.value = data;
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  editing.value = null;
  form.value = { name: '', unit: 'шт', price: 0, stock: 0 };
  showModal.value = true;
}
function openEdit(m: Material) {
  editing.value = m;
  form.value = { name: m.name, unit: m.unit ?? '', price: Number(m.price ?? 0), stock: m.stock };
  showModal.value = true;
}
async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await http.patch(`/materials/${editing.value.id}`, form.value);
      toast.success('Материал обновлён');
    } else {
      await http.post('/materials', form.value);
      toast.success('Материал создан');
    }
    showModal.value = false;
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    saving.value = false;
  }
}
async function remove(m: Material) {
  if (!confirm(`Удалить материал «${m.name}»?`)) return;
  try {
    await http.delete(`/materials/${m.id}`);
    toast.success('Удалён');
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  }
}
onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Справочник материалов" subtitle="Номенклатура, цены и остатки">
      <template #actions><AppButton @click="openCreate"><Plus class="h-4 w-4" /> Добавить</AppButton></template>
    </PageHeader>

    <SkeletonList v-if="loading" />
    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-5 py-3 font-medium">Материал</th>
            <th class="px-5 py-3 font-medium">Ед.</th>
            <th class="px-5 py-3 font-medium">Цена</th>
            <th class="px-5 py-3 font-medium">Остаток</th>
            <th class="px-5 py-3 text-right font-medium">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="m in items" :key="m.id" class="transition hover:bg-slate-50/60">
            <td class="px-5 py-3 font-medium text-slate-700">{{ m.name }}</td>
            <td class="px-5 py-3 text-slate-500">{{ m.unit }}</td>
            <td class="px-5 py-3 text-slate-500">{{ formatMoney(m.price) }}</td>
            <td class="px-5 py-3 text-slate-500">{{ m.stock }}</td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-1">
                <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" @click="openEdit(m)"><Pencil class="h-4 w-4" /></button>
                <button class="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" @click="remove(m)"><Trash2 class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal v-model="showModal" :title="editing ? 'Редактировать материал' : 'Новый материал'">
      <form class="space-y-3" @submit.prevent="save">
        <div><label class="label">Название</label><input v-model="form.name" class="input" required /></div>
        <div class="grid grid-cols-3 gap-3">
          <div><label class="label">Ед. изм.</label><input v-model="form.unit" class="input" /></div>
          <div><label class="label">Цена, ₽</label><input v-model.number="form.price" type="number" min="0" class="input" /></div>
          <div><label class="label">Остаток</label><input v-model.number="form.stock" type="number" min="0" class="input" /></div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <AppButton variant="secondary" type="button" @click="showModal = false">Отмена</AppButton>
          <AppButton type="submit" :loading="saving">Сохранить</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
