<script setup lang="ts">
import { ref, watch } from 'vue';
import { http, errorMessage } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { User } from '@/types';
import AppModal from '@/components/ui/AppModal.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { Search, UserPlus, Check } from 'lucide-vue-next';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [boolean]; created: [] }>();

const toast = useToastStore();

const mode = ref<'search' | 'new'>('search');
const search = ref('');
const results = ref<User[]>([]);
const selected = ref<User | null>(null);
const searching = ref(false);

// Поля нового клиента
const newClient = ref({ fullName: '', phone: '', email: '' });

const deviceInfo = ref('');
const defectDescription = ref('');
const saving = ref(false);

let searchTimer: ReturnType<typeof setTimeout>;
watch(search, (val) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (!val.trim()) {
      results.value = [];
      return;
    }
    searching.value = true;
    try {
      const { data } = await http.get('/clients', { params: { search: val } });
      results.value = data;
    } finally {
      searching.value = false;
    }
  }, 300);
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset();
  },
);

function reset() {
  mode.value = 'search';
  search.value = '';
  results.value = [];
  selected.value = null;
  newClient.value = { fullName: '', phone: '', email: '' };
  deviceInfo.value = '';
  defectDescription.value = '';
}

function pick(c: User) {
  selected.value = c;
}

async function submit() {
  saving.value = true;
  try {
    let clientId: number;
    if (mode.value === 'new') {
      const { data } = await http.post('/clients', newClient.value);
      clientId = data.user.id;
      toast.success('Клиент создан');
    } else {
      if (!selected.value) {
        toast.error('Выберите клиента');
        return;
      }
      clientId = selected.value.id;
    }
    await http.post('/orders', {
      clientId,
      deviceInfo: deviceInfo.value,
      defectDescription: defectDescription.value,
    });
    toast.success('Заказ создан');
    emit('created');
    emit('update:modelValue', false);
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AppModal :model-value="modelValue" title="Новый заказ" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-5">
      <!-- Переключатель клиента -->
      <div class="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          class="flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition"
          :class="mode === 'search' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'"
          @click="mode = 'search'"
        >
          Найти клиента
        </button>
        <button
          class="flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition"
          :class="mode === 'new' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'"
          @click="mode = 'new'"
        >
          Новый клиент
        </button>
      </div>

      <!-- Поиск существующего -->
      <div v-if="mode === 'search'">
        <label class="label">Поиск по телефону или ФИО</label>
        <div class="relative">
          <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input v-model="search" class="input pl-9" placeholder="+7900... или Иванов" />
        </div>
        <div v-if="results.length" class="mt-2 max-h-44 space-y-1 overflow-auto">
          <button
            v-for="c in results"
            :key="c.id"
            class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition"
            :class="selected?.id === c.id ? 'border-brand-300 bg-brand-50' : 'border-slate-100 hover:bg-slate-50'"
            @click="pick(c)"
          >
            <span>
              <span class="font-medium text-slate-700">{{ c.fullName }}</span>
              <span class="ml-2 text-slate-400">{{ c.phone }}</span>
            </span>
            <Check v-if="selected?.id === c.id" class="h-4 w-4 text-brand-600" />
          </button>
        </div>
        <p v-else-if="search && !searching" class="mt-2 text-sm text-slate-400">
          Не найдено. Создайте нового клиента.
        </p>
      </div>

      <!-- Новый клиент -->
      <div v-else class="space-y-3">
        <div>
          <label class="label">ФИО</label>
          <input v-model="newClient.fullName" class="input" placeholder="Иванов Иван Иванович" />
        </div>
        <div>
          <label class="label">Телефон</label>
          <input v-model="newClient.phone" class="input" placeholder="+79001234567" />
        </div>
        <div>
          <label class="label">Email (необязательно)</label>
          <input v-model="newClient.email" class="input" placeholder="client@mail.ru" />
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- Данные устройства -->
      <div>
        <label class="label">Устройство</label>
        <input v-model="deviceInfo" class="input" placeholder="Например: Ноутбук Lenovo IdeaPad 5" />
      </div>
      <div>
        <label class="label">Описание неисправности (со слов клиента)</label>
        <textarea v-model="defectDescription" class="input" rows="3" placeholder="Не включается, не заряжается..." />
      </div>

      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" @click="emit('update:modelValue', false)">Отмена</AppButton>
        <AppButton :loading="saving" @click="submit">
          <UserPlus class="h-4 w-4" /> Создать заказ
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
