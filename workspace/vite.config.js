import tailwind from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwind()],
  server: {
    proxy: {
      '/api/audit-workspace': 'http://127.0.0.1:8000',
    },
  },
});
