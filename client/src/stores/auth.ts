import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { http } from '@/api/http';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));
  const role = computed(() => user.value?.role ?? null);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  async function fetchMe() {
    if (!token.value) return;
    loading.value = true;
    try {
      const { data } = await http.get('/auth/me');
      user.value = data.user;
    } finally {
      loading.value = false;
    }
  }

  async function loginWithPassword(login: string, password: string) {
    const { data } = await http.post('/auth/login', { login, password });
    setToken(data.token);
    user.value = data.user;
  }

  async function requestCode(phone: string): Promise<string> {
    const { data } = await http.post('/auth/request-code', { phone });
    return data.demoCode; // показывается на экране (имитация СМС)
  }

  async function verifyCode(phone: string, code: string) {
    const { data } = await http.post('/auth/verify-code', { phone, code });
    setToken(data.token);
    user.value = data.user;
  }

  async function setCredentials(login: string, password: string) {
    const { data } = await http.post('/auth/set-credentials', { login, password });
    user.value = data.user;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    role,
    fetchMe,
    loginWithPassword,
    requestCode,
    verifyCode,
    setCredentials,
    logout,
  };
});
