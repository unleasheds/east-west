import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // '/east-west/' for GitHub Pages, '/' for Railway (set VITE_BASE=/ in Railway env)
  base: process.env.VITE_BASE ?? '/east-west/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
