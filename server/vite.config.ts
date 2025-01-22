import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'node22' // Укажите вашу версию Node.js
    }
  },
  server: {
    middlewareMode: true
  },
  build: {
    target: 'node22',  // Настройка для Node.js
    outDir: 'dist'
  }
});
