import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs (0.0.0.0) for iPad access
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  }
});
