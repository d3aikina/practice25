import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // слушать на всех интерфейсах (0.0.0.0) — доступ из локальной сети
    port: 5173,
    strictPort: true, // не «уползать» на 5174 — если порт занят, явно упасть
    proxy: {
      // Запросы /api проксируются на backend этой же машины (PORT из server/.env),
      // поэтому с других устройств всё работает как single-origin (без CORS-проблем)
      '/api': 'http://localhost:8080',
    },
  },
});
