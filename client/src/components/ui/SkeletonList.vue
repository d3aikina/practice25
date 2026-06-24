<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 });
</script>

<template>
  <div class="space-y-3">
    <div v-for="i in rows" :key="i" class="card flex items-center gap-4 p-4">
      <div class="skeleton h-12 w-12 rounded-xl" />
      <div class="flex-1 space-y-2">
        <div class="skeleton h-4 w-1/3 rounded" />
        <div class="skeleton h-3 w-2/3 rounded" />
      </div>
      <div class="skeleton h-6 w-24 rounded-full" />
    </div>
  </div>
</template>
