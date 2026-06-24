<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { Service } from '@/types';
import { formatMoney } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppModal from '@/components/ui/AppModal.vue';
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-vue-next';

const toast = useToastStore();
const items = ref<Service[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref<Service | null>(null);
const form = ref<any>({ name: '', basePrice: 0, description: '' });
const saving = ref(false);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/services');
    items.value = data;
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  editing.value = null;
  form.value = { name: '', basePrice: 0, description: '' };
  showModal.value = true;
}
function openEdit(s: Service) {
  editing.value = s;
  form.value = { name: s.name, basePrice: Number(s.basePrice ?? 0), description: s.description ?? '' };
  showModal.value = true;
}
async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await http.patch(`/services/${editing.value.id}`, form.value);
      toast.success('Услуга обновлена');
    } else {
      await http.post('/services', form.value);
      toast.success('Услуга создана');
    }
    showModal.value = false;
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    saving.value = false;
  }
}
async function remove(s: Service) {
  if (!confirm(`Удалить услугу «${s.name}»?`)) return;
  try {
    await http.delete(`/services/${s.id}`);
    toast.success('Удалена');
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  }
}
onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Справочник услуг" subtitle="Цены и описания услуг мастерской">
      <template #actions><AppButton @click="openCreate"><Plus class="h-4 w-4" /> Добавить</AppButton></template>
    </PageHeader>

    <SkeletonList v-if="loading" />
    <TransitionGroup v-else name="list" tag="div" class="grid gap-3 sm:grid-cols-2">
      <div v-for="s in items" :key="s.id" class="card group flex items-start gap-3 p-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          <ListChecks class="h-5 w-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-slate-700">{{ s.name }}</p>
          <p class="line-clamp-1 text-xs text-slate-400">{{ s.description }}</p>
          <p class="mt-1 text-sm font-semibold text-brand-600">{{ formatMoney(s.basePrice) }}</p>
        </div>
        <div class="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" @click="openEdit(s)"><Pencil class="h-4 w-4" /></button>
          <button class="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" @click="remove(s)"><Trash2 class="h-4 w-4" /></button>
        </div>
      </div>
    </TransitionGroup>

    <AppModal v-model="showModal" :title="editing ? 'Редактировать услугу' : 'Новая услуга'">
      <form class="space-y-3" @submit.prevent="save">
        <div><label class="label">Название</label><input v-model="form.name" class="input" required /></div>
        <div><label class="label">Базовая цена, ₽</label><input v-model.number="form.basePrice" type="number" min="0" class="input" /></div>
        <div><label class="label">Описание</label><textarea v-model="form.description" rows="2" class="input" /></div>
        <div class="flex justify-end gap-2 pt-2">
          <AppButton variant="secondary" type="button" @click="showModal = false">Отмена</AppButton>
          <AppButton type="submit" :loading="saving">Сохранить</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
