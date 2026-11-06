import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo, /api va al backend: mismo origen, cookies sin complicaciones.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
