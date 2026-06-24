<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { User, Role } from '@/types';
import { roleLabels } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import SkeletonList from '@/components/ui/SkeletonList.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppBadge from '@/components/ui/AppBadge.vue';
import AppModal from '@/components/ui/AppModal.vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';

const toast = useToastStore();
const users = ref<User[]>([]);
const loading = ref(true);

const showModal = ref(false);
const editing = ref<User | null>(null);
const form = ref<any>({ role: 'Master', login: '', password: '', fullName: '', phone: '', email: '' });
const saving = ref(false);

const roleTone: Record<Role, string> = { Client: 'gray', Manager: 'blue', Master: 'indigo', Admin: 'violet' };

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get('/users');
    users.value = data;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.value = { role: 'Master', login: '', password: '', fullName: '', phone: '', email: '' };
  showModal.value = true;
}

function openEdit(u: User) {
  editing.value = u;
  form.value = { role: u.role, login: u.login ?? '', password: '', fullName: u.fullName ?? '', phone: u.phone ?? '', email: u.email ?? '' };
  showModal.value = true;
}

async function save() {
  saving.value = true;
  try {
    const payload: any = { ...form.value };
    if (!payload.password) delete payload.password;
    if (!payload.login) delete payload.login;
    if (editing.value) {
      await http.patch(`/users/${editing.value.id}`, payload);
      toast.success('Пользователь обновлён');
    } else {
      await http.post('/users', payload);
      toast.success('Пользователь создан');
    }
    showModal.value = false;
    await load();
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    saving.value = false;
  }
}

async function remove(u: User) {
  if (!confirm(`Удалить пользователя «${u.fullName}»?`)) return;
  try {
    await http.delete(`/users/${u.id}`);
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
    <PageHeader title="Пользователи" subtitle="Управление учётными записями">
      <template #actions>
        <AppButton @click="openCreate"><Plus class="h-4 w-4" /> Добавить</AppButton>
      </template>
    </PageHeader>

    <SkeletonList v-if="loading" />
    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-5 py-3 font-medium">ФИО</th>
            <th class="px-5 py-3 font-medium">Роль</th>
            <th class="px-5 py-3 font-medium">Логин</th>
            <th class="px-5 py-3 font-medium">Телефон</th>
            <th class="px-5 py-3 text-right font-medium">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in users" :key="u.id" class="transition hover:bg-slate-50/60">
            <td class="px-5 py-3 font-medium text-slate-700">{{ u.fullName ?? '—' }}</td>
            <td class="px-5 py-3"><AppBadge :tone="roleTone[u.role]">{{ roleLabels[u.role] }}</AppBadge></td>
            <td class="px-5 py-3 text-slate-500">{{ u.login ?? '—' }}</td>
            <td class="px-5 py-3 text-slate-500">{{ u.phone ?? '—' }}</td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-1">
                <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" @click="openEdit(u)"><Pencil class="h-4 w-4" /></button>
                <button class="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" @click="remove(u)"><Trash2 class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal v-model="showModal" :title="editing ? 'Редактировать пользователя' : 'Новый пользователь'">
      <form class="space-y-3" @submit.prevent="save">
        <div>
          <label class="label">Роль</label>
          <select v-model="form.role" class="input">
            <option value="Manager">Менеджер</option>
            <option value="Master">Мастер</option>
            <option value="Admin">Администратор</option>
            <option value="Client">Клиент</option>
          </select>
        </div>
        <div>
          <label class="label">ФИО</label>
          <input v-model="form.fullName" class="input" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Логин</label>
            <input v-model="form.login" class="input" placeholder="необязательно" />
          </div>
          <div>
            <label class="label">Пароль</label>
            <input v-model="form.password" type="text" class="input" :placeholder="editing ? 'без изменений' : 'необязательно'" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Телефон</label>
            <input v-model="form.phone" class="input" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" class="input" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <AppButton variant="secondary" type="button" @click="showModal = false">Отмена</AppButton>
          <AppButton type="submit" :loading="saving">Сохранить</AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
