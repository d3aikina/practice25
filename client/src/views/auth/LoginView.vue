<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { errorMessage } from '@/api/http';
import AppButton from '@/components/ui/AppButton.vue';
import { Smartphone } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();
const toast = useToastStore();

const login = ref('');
const password = ref('');
const loading = ref(false);

async function submit() {
  loading.value = true;
  try {
    await auth.loginWithPassword(login.value, password.value);
    toast.success('Добро пожаловать!');
    router.push('/');
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-slate-800">Вход в систему</h2>
    <p class="mt-1 text-sm text-slate-400">Введите логин и пароль для входа</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Логин</label>
        <input v-model="login" class="input" placeholder="manager" autocomplete="username" required />
      </div>
      <div>
        <label class="label">Пароль</label>
        <input v-model="password" type="password" class="input" placeholder="••••••••" autocomplete="current-password" required />
      </div>
      <AppButton type="submit" :loading="loading" block>Войти</AppButton>
    </form>

    <div class="my-6 flex items-center gap-3 text-xs text-slate-300">
      <div class="h-px flex-1 bg-slate-200" />
      или
      <div class="h-px flex-1 bg-slate-200" />
    </div>

    <RouterLink
      to="/login/phone"
      class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <Smartphone class="h-4 w-4" />
      Войти по номеру телефона
    </RouterLink>

    <p class="mt-6 text-center text-xs text-slate-400">
      Клиенты входят по номеру телефона.<br />
      Демо: <b>manager</b> / manager123 · <b>master</b> / master123 · <b>admin</b> / admin123
    </p>
  </div>
</template>
