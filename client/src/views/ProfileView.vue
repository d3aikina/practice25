<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http, errorMessage } from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { roleLabels } from '@/lib/labels';
import PageHeader from '@/components/PageHeader.vue';
import AppButton from '@/components/ui/AppButton.vue';

const auth = useAuthStore();
const toast = useToastStore();

const form = ref({ fullName: '', phone: '', email: '' });
const creds = ref({ login: '', password: '' });
const savingProfile = ref(false);
const savingCreds = ref(false);

onMounted(() => {
  form.value = {
    fullName: auth.user?.fullName ?? '',
    phone: auth.user?.phone ?? '',
    email: auth.user?.email ?? '',
  };
  creds.value.login = auth.user?.login ?? '';
});

async function saveProfile() {
  savingProfile.value = true;
  try {
    const { data } = await http.patch('/users/me', form.value);
    auth.user = data.user;
    toast.success('Профиль сохранён');
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    savingProfile.value = false;
  }
}

async function saveCreds() {
  savingCreds.value = true;
  try {
    await auth.setCredentials(creds.value.login, creds.value.password);
    creds.value.password = '';
    toast.success('Данные для входа обновлены');
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    savingCreds.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <PageHeader title="Профиль" :subtitle="auth.role ? roleLabels[auth.role] : ''" />

    <div class="card mb-6 p-6">
      <h3 class="mb-4 text-sm font-semibold text-slate-700">Личная информация</h3>
      <form class="space-y-4" @submit.prevent="saveProfile">
        <div>
          <label class="label">ФИО</label>
          <input v-model="form.fullName" class="input" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label">Телефон</label>
            <input v-model="form.phone" class="input" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" class="input" />
          </div>
        </div>
        <AppButton type="submit" :loading="savingProfile">Сохранить</AppButton>
      </form>
    </div>

    <div class="card p-6">
      <h3 class="mb-1 text-sm font-semibold text-slate-700">Данные для входа</h3>
      <p class="mb-4 text-xs text-slate-400">Логин и пароль для входа без кода по телефону</p>
      <form class="space-y-4" @submit.prevent="saveCreds">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label">Логин</label>
            <input v-model="creds.login" class="input" minlength="3" required />
          </div>
          <div>
            <label class="label">Новый пароль</label>
            <input v-model="creds.password" type="password" class="input" minlength="4" required placeholder="••••••••" />
          </div>
        </div>
        <AppButton type="submit" variant="secondary" :loading="savingCreds">Обновить доступ</AppButton>
      </form>
    </div>
  </div>
</template>
