// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('🚀 VITE PROXY → http://127.0.0.1:5000'); 

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000/',  // force IPv4
        changeOrigin: true,
        secure: false,
      },
    },
  },
});