<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { errorMessage } from '@/api/http';
import AppButton from '@/components/ui/AppButton.vue';
import { ArrowLeft, MessageSquare } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();
const toast = useToastStore();

const step = ref<'phone' | 'code'>('phone');
const phone = ref('');
const code = ref('');
const demoCode = ref('');
const loading = ref(false);

async function requestCode() {
  loading.value = true;
  try {
    demoCode.value = await auth.requestCode(phone.value);
    step.value = 'code';
    toast.info('Код отправлен');
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

async function verify() {
  loading.value = true;
  try {
    await auth.verifyCode(phone.value, code.value);
    toast.success('Вы вошли');
    // Если у клиента ещё нет логина/пароля — предложим задать
    if (!auth.user?.hasCredentials) {
      router.push('/login/set-credentials');
    } else {
      router.push('/');
    }
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <RouterLink to="/login" class="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600">
      <ArrowLeft class="h-4 w-4" /> Назад
    </RouterLink>

    <!-- Шаг 1: ввод телефона -->
    <div v-if="step === 'phone'">
      <h2 class="text-2xl font-bold text-slate-800">Вход по телефону</h2>
      <p class="mt-1 text-sm text-slate-400">Мы отправим код подтверждения</p>
      <form class="mt-8 space-y-4" @submit.prevent="requestCode">
        <div>
          <label class="label">Номер телефона</label>
          <input v-model="phone" class="input" placeholder="+79001112233" required />
        </div>
        <AppButton type="submit" :loading="loading" block>Получить код</AppButton>
      </form>
      <p class="mt-6 text-center text-xs text-slate-400">Демо-клиент: +79001112233</p>
    </div>

    <!-- Шаг 2: ввод кода -->
    <div v-else>
      <h2 class="text-2xl font-bold text-slate-800">Введите код</h2>
      <p class="mt-1 text-sm text-slate-400">Отправлен на {{ phone }}</p>

      <!-- Имитация СМС: код выводится прямо на экран -->
      <div class="mt-5 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-brand-800">
        <MessageSquare class="h-5 w-5 shrink-0" />
        <div class="text-sm">
          <p class="font-medium">СМС с кодом (демо-режим)</p>
          <p>Ваш код: <span class="text-lg font-bold tracking-widest">{{ demoCode }}</span></p>
        </div>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="verify">
        <div>
          <label class="label">Код из СМС</label>
          <input
            v-model="code"
            class="input text-center text-lg tracking-[0.5em]"
            maxlength="6"
            placeholder="000000"
            required
          />
        </div>
        <AppButton type="submit" :loading="loading" block>Подтвердить</AppButton>
        <button type="button" class="w-full text-center text-sm text-slate-400 hover:text-slate-600" @click="step = 'phone'">
          Изменить номер
        </button>
      </form>
    </div>
  </div>
</template>
