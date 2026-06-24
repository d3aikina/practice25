<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { errorMessage } from '@/api/http';
import AppButton from '@/components/ui/AppButton.vue';

const auth = useAuthStore();
const router = useRouter();
const toast = useToastStore();

const login = ref('');
const password = ref('');
const loading = ref(false);

async function submit() {
  loading.value = true;
  try {
    await auth.setCredentials(login.value, password.value);
    toast.success('Данные для входа сохранены');
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
    <h2 class="text-2xl font-bold text-slate-800">Создайте логин и пароль</h2>
    <p class="mt-1 text-sm text-slate-400">
      Чтобы в следующий раз входить быстрее. Можно пропустить и продолжить.
    </p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Логин</label>
        <input v-model="login" class="input" placeholder="Придумайте логин" minlength="3" required />
      </div>
      <div>
        <label class="label">Пароль</label>
        <input v-model="password" type="password" class="input" placeholder="Минимум 4 символа" minlength="4" required />
      </div>
      <AppButton type="submit" :loading="loading" block>Сохранить</AppButton>
      <button type="button" class="w-full text-center text-sm text-slate-400 hover:text-slate-600" @click="router.push('/')">
        Пропустить
      </button>
    </form>
  </div>
</template>
