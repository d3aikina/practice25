<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { http, errorMessage } from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import type { Order, Service, Material } from '@/types';
import {
  orderStatusLabels,
  orderStatusTone,
  serviceStatusLabels,
  materialRequestStatusLabels,
  materialRequestStatusTone,
  formatMoney,
  formatDate,
} from '@/lib/labels';
import StatusTimeline from '@/components/StatusTimeline.vue';
import AppBadge from '@/components/ui/AppBadge.vue';
import AppButton from '@/components/ui/AppButton.vue';
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Check,
  PackagePlus,
  User,
  Wrench,
  Phone,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const order = ref<Order | null>(null);
const loading = ref(true);
const services = ref<Service[]>([]);
const materials = ref<Material[]>([]);

const id = computed(() => Number(route.params.id));
const role = computed(() => auth.role);

const isMaster = computed(() => role.value === 'Master');
const isManager = computed(() => role.value === 'Manager' || role.value === 'Admin');
const isClient = computed(() => role.value === 'Client');
const canDiagnose = computed(
  () => isMaster.value && order.value?.masterId === auth.user?.id &&
    ['Diagnostics', 'InProgress', 'AwaitingParts'].includes(order.value?.status ?? ''),
);

async function load() {
  loading.value = true;
  try {
    const { data } = await http.get(`/orders/${id.value}`);
    order.value = data;
    if (!estimateTouched.value) estimateValue.value = order.value?.totals?.total ?? null;
    if (!finalTouched.value) finalValue.value = order.value?.totals?.total ?? null;
  } catch (e) {
    toast.error(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

async function loadCatalogs() {
  if (isMaster.value || isManager.value) {
    const [s, m] = await Promise.all([http.get('/services'), http.get('/materials')]);
    services.value = s.data;
    materials.value = m.data;
  }
}

async function takeOrder() {
  await run(() => http.post(`/orders/${id.value}/take`), 'Заказ взят в работу');
}

const newServiceId = ref<number | null>(null);
async function addService() {
  if (!newServiceId.value) return;
  await run(() => http.post(`/orders/${id.value}/services`, { serviceId: newServiceId.value }), 'Услуга добавлена');
  newServiceId.value = null;
}
async function toggleService(osId: number, done: boolean) {
  await run(
    () => http.patch(`/order-services/${osId}`, { status: done ? 'Done' : 'Planned' }),
    done ? 'Услуга выполнена' : 'Услуга возвращена в план',
  );
}
async function removeService(osId: number) {
  await run(() => http.delete(`/order-services/${osId}`), 'Услуга удалена');
}

const newMaterialId = ref<number | null>(null);
const newMaterialQty = ref(1);
async function addMaterial() {
  if (!newMaterialId.value) return;
  await run(
    () => http.post(`/orders/${id.value}/materials`, { materialId: newMaterialId.value, quantityPlanned: newMaterialQty.value }),
    'Материал добавлен',
  );
  newMaterialId.value = null;
  newMaterialQty.value = 1;
}
async function setUsed(omId: number, used: number) {
  await run(() => http.patch(`/order-materials/${omId}`, { quantityUsed: used }), 'Списано со склада');
}
async function removeMaterial(omId: number) {
  await run(() => http.delete(`/order-materials/${omId}`), 'Материал удалён');
}
async function requestMaterial(materialId: number, quantity: number) {
  await run(
    () => http.post(`/orders/${id.value}/material-requests`, { materialId, quantity }),
    'Заявка на материал отправлена',
  );
}

const estimateValue = ref<number | null>(null);
const estimateTouched = ref(false);
async function setEstimate() {
  if (!estimateValue.value) return;
  await run(() => http.patch(`/orders/${id.value}/estimate`, { estimatedCost: estimateValue.value }), 'Смета выставлена');
  estimateTouched.value = false;
}
async function confirmOrder() {
  await run(() => http.post(`/orders/${id.value}/confirm`), 'Клиент согласился — в работу');
}
async function rejectOrder() {
  await run(() => http.post(`/orders/${id.value}/reject`), 'Заказ отменён');
}
async function markReady() {
  await run(() => http.post(`/orders/${id.value}/ready`), 'Ремонт завершён, ожидает выдачи');
}
const finalValue = ref<number | null>(null);
const finalTouched = ref(false);
async function completeOrder() {
  if (!finalValue.value) return;
  await run(() => http.post(`/orders/${id.value}/complete`, { finalCost: finalValue.value }), 'Заказ завершён и выдан');
  finalTouched.value = false;
}
async function updateRequest(reqId: number, status: string) {
  await run(() => http.patch(`/material-requests/${reqId}`, { status }), 'Статус заявки обновлён');
}

async function run(fn: () => Promise<unknown>, okMsg: string) {
  try {
    await fn();
    await load();
    toast.success(okMsg);
  } catch (e) {
    toast.error(errorMessage(e));
  }
}

onMounted(async () => {
  await Promise.all([load(), loadCatalogs()]);
});
</script>

<template>
  <div v-if="order">
    <!-- Шапка -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100" @click="router.back()">
          <ArrowLeft class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-slate-800">Заказ №{{ order.id }}</h1>
          <p class="text-sm text-slate-400">{{ order.deviceInfo }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <AppBadge :tone="orderStatusTone[order.status]">{{ orderStatusLabels[order.status] }}</AppBadge>
        <RouterLink v-if="isManager" :to="`/orders/${order.id}/print`" target="_blank">
          <AppButton variant="secondary" size="sm"><Printer class="h-4 w-4" /> Смета</AppButton>
        </RouterLink>
      </div>
    </div>

    <div class="card mb-6 overflow-x-auto p-6">
      <StatusTimeline :status="order.status" />
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <div class="card p-6">
          <h3 class="mb-2 text-sm font-semibold text-slate-700">Неисправность</h3>
          <p class="text-sm text-slate-600">{{ order.defectDescription }}</p>
        </div>

        <div class="card p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-700">Работы и услуги</h3>
            <span class="text-sm font-semibold text-brand-600">{{ formatMoney(order.totals?.servicesTotal) }}</span>
          </div>

          <div v-if="!order.services.length" class="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-400">
            Услуги ещё не добавлены
          </div>
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="os in order.services" :key="os.id" class="flex items-center gap-3 py-3">
              <button
                v-if="canDiagnose"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition"
                :class="os.status === 'Done' ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-transparent hover:border-brand-400'"
                @click="toggleService(os.id, os.status !== 'Done')"
              >
                <Check class="h-4 w-4" />
              </button>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-700">{{ os.service.name }}</p>
                <p class="text-xs text-slate-400">{{ serviceStatusLabels[os.status] }}</p>
              </div>
              <span class="text-sm text-slate-600">{{ formatMoney(os.actualPrice ?? os.service.basePrice) }}</span>
              <button v-if="canDiagnose" class="text-slate-300 hover:text-red-500" @click="removeService(os.id)">
                <Trash2 class="h-4 w-4" />
              </button>
            </li>
          </ul>

          <div v-if="canDiagnose" class="mt-4 flex gap-2">
            <select v-model="newServiceId" class="input flex-1">
              <option :value="null" disabled>Выберите услугу…</option>
              <option v-for="s in services" :key="s.id" :value="s.id">
                {{ s.name }} — {{ formatMoney(s.basePrice) }}
              </option>
            </select>
            <AppButton size="sm" variant="secondary" @click="addService"><Plus class="h-4 w-4" /> Добавить</AppButton>
          </div>
        </div>

        <div class="card p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-700">Материалы</h3>
            <span class="text-sm font-semibold text-brand-600">{{ formatMoney(order.totals?.materialsTotal) }}</span>
          </div>

          <div v-if="!order.materials.length" class="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-400">
            Материалы не запланированы
          </div>
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="om in order.materials" :key="om.id" class="flex flex-wrap items-center gap-3 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-700">{{ om.material.name }}</p>
                <p class="text-xs text-slate-400">
                  План: {{ om.quantityPlanned ?? 0 }} {{ om.material.unit }}
                  <template v-if="!isClient"> · На складе: {{ om.material.stock }}</template>
                </p>
              </div>
              <div v-if="canDiagnose" class="flex items-center gap-1.5">
                <span class="text-xs text-slate-400">Исп.:</span>
                <input
                  type="number"
                  min="0"
                  :value="om.quantityUsed ?? 0"
                  class="input w-20 px-2 py-1.5 text-center text-sm"
                  @change="setUsed(om.id, Number(($event.target as HTMLInputElement).value))"
                />
              </div>
              <span v-else class="text-sm text-slate-600">Исп.: {{ om.quantityUsed ?? 0 }}</span>

              <button
                v-if="canDiagnose && om.material.stock < (om.quantityPlanned ?? 0)"
                class="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                @click="requestMaterial(om.materialId, (om.quantityPlanned ?? 0) - om.material.stock)"
              >
                <PackagePlus class="h-3.5 w-3.5" /> Заказать
              </button>
              <button v-if="canDiagnose" class="text-slate-300 hover:text-red-500" @click="removeMaterial(om.id)">
                <Trash2 class="h-4 w-4" />
              </button>
            </li>
          </ul>

          <div v-if="canDiagnose" class="mt-4 flex gap-2">
            <select v-model="newMaterialId" class="input flex-1">
              <option :value="null" disabled>Выберите материал…</option>
              <option v-for="m in materials" :key="m.id" :value="m.id">
                {{ m.name }} (склад: {{ m.stock }})
              </option>
            </select>
            <input v-model.number="newMaterialQty" type="number" min="1" class="input w-20 text-center" />
            <AppButton size="sm" variant="secondary" @click="addMaterial"><Plus class="h-4 w-4" /></AppButton>
          </div>
        </div>

        <div v-if="order.materialRequests.length" class="card p-6">
          <h3 class="mb-4 text-sm font-semibold text-slate-700">Заявки на материалы</h3>
          <ul class="divide-y divide-slate-100">
            <li v-for="r in order.materialRequests" :key="r.id" class="flex items-center gap-3 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-700">{{ r.material.name }}</p>
                <p class="text-xs text-slate-400">Количество: {{ r.quantity }} {{ r.material.unit }}</p>
              </div>
              <AppBadge :tone="materialRequestStatusTone[r.status]">{{ materialRequestStatusLabels[r.status] }}</AppBadge>
              <div v-if="isManager" class="flex gap-1">
                <AppButton v-if="r.status === 'Requested'" size="sm" variant="secondary" @click="updateRequest(r.id, 'Ordered')">Заказать</AppButton>
                <AppButton v-if="r.status !== 'Received'" size="sm" variant="success" @click="updateRequest(r.id, 'Received')">Получено</AppButton>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card space-y-3 p-6">
          <h3 class="text-sm font-semibold text-slate-700">Действия</h3>

          <AppButton
            v-if="isMaster && !order.masterId && order.status === 'Created'"
            block
            @click="takeOrder"
          >
            <Wrench class="h-4 w-4" /> Взять на диагностику
          </AppButton>

          <template v-if="isManager && order.status === 'Diagnostics'">
            <label class="label">Ориентировочная стоимость</label>
            <div class="flex gap-2">
              <input v-model.number="estimateValue" type="number" class="input" placeholder="0" @input="estimateTouched = true" />
              <AppButton @click="setEstimate">ОК</AppButton>
            </div>
            <p class="text-xs text-slate-400">Подставлено по добавленным услугам/материалам, можно изменить.</p>
          </template>

          <template v-if="isManager && order.status === 'AwaitingConfirmation'">
            <p class="text-sm text-slate-500">Клиенту озвучена стоимость {{ formatMoney(order.estimatedCost) }}.</p>
            <AppButton block variant="success" @click="confirmOrder"><Check class="h-4 w-4" /> Клиент согласен</AppButton>
            <AppButton block variant="danger" @click="rejectOrder">Клиент отказался</AppButton>
          </template>

          <AppButton v-if="isManager && order.status === 'InProgress'" block @click="markReady">
            Ремонт выполнен
          </AppButton>

          <template v-if="isManager && order.status === 'AwaitingPickup'">
            <label class="label">Итоговая стоимость</label>
            <div class="flex gap-2">
              <input v-model.number="finalValue" type="number" class="input" placeholder="0" @input="finalTouched = true" />
              <AppButton variant="success" @click="completeOrder">Выдать</AppButton>
            </div>
          </template>

          <p
            v-if="['Completed', 'Cancelled'].includes(order.status)"
            class="rounded-xl bg-slate-50 py-3 text-center text-sm text-slate-400"
          >
            Заказ закрыт
          </p>
          <p
            v-else-if="!canDiagnose && !isManager && !(isMaster && !order.masterId)"
            class="rounded-xl bg-slate-50 py-3 text-center text-sm text-slate-400"
          >
            Ожидайте обновления статуса
          </p>
        </div>

        <div class="card space-y-2 p-6 text-sm">
          <h3 class="mb-2 text-sm font-semibold text-slate-700">Стоимость</h3>
          <div class="flex justify-between"><span class="text-slate-400">Услуги</span><span>{{ formatMoney(order.totals?.servicesTotal) }}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Материалы</span><span>{{ formatMoney(order.totals?.materialsTotal) }}</span></div>
          <div class="flex justify-between border-t border-slate-100 pt-2 font-semibold">
            <span>Итого</span><span class="text-brand-600">{{ formatMoney(order.totals?.total) }}</span>
          </div>
          <div v-if="order.estimatedCost" class="flex justify-between pt-1 text-xs text-slate-400">
            <span>Смета</span><span>{{ formatMoney(order.estimatedCost) }}</span>
          </div>
          <div v-if="order.finalCost" class="flex justify-between text-xs text-slate-400">
            <span>Оплачено</span><span>{{ formatMoney(order.finalCost) }}</span>
          </div>
        </div>

        <div class="card space-y-3 p-6 text-sm">
          <h3 class="text-sm font-semibold text-slate-700">Участники</h3>
          <div class="flex items-center gap-2 text-slate-600">
            <User class="h-4 w-4 text-slate-400" />
            <span>{{ order.client?.fullName }}</span>
          </div>
          <div v-if="order.client?.phone" class="flex items-center gap-2 text-slate-600">
            <Phone class="h-4 w-4 text-slate-400" />
            <span>{{ order.client?.phone }}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-600">
            <Wrench class="h-4 w-4 text-slate-400" />
            <span>{{ order.master?.fullName ?? 'Мастер не назначен' }}</span>
          </div>
          <p class="pt-1 text-xs text-slate-400">Создан: {{ formatDate(order.createdAt) }}</p>
          <p v-if="order.completedAt" class="text-xs text-slate-400">Закрыт: {{ formatDate(order.completedAt) }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="py-20 text-center text-slate-400">Загрузка…</div>
</template>
