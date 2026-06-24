<script setup lang="ts">
import { Wrench } from 'lucide-vue-next';
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Левая брендовая панель -->
    <div
      class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white lg:flex"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Wrench class="h-6 w-6" />
        </div>
        <span class="text-xl font-bold">РемСервис</span>
      </div>

      <div class="relative z-10">
        <h1 class="text-4xl font-extrabold leading-tight">
          Ремонт техники<br />под контролем
        </h1>
        <p class="mt-4 max-w-md text-brand-100">
          Приём заявок, диагностика, склад материалов и прозрачные статусы заказов —
          всё в одной системе.
        </p>
      </div>

      <p class="relative z-10 text-sm text-brand-200">© 2026 РемСервис</p>

      <!-- Декоративные круги -->
      <div class="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div class="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
    </div>

    <!-- Правая часть — форма -->
    <div class="flex w-full items-center justify-center bg-slate-50 p-6 lg:w-1/2">
      <div class="w-full max-w-sm animate-fade-in-up">
        <RouterView />
      </div>
    </div>
  </div>
</template>
