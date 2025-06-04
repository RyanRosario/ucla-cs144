import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',         // Allow all IPs
    port: 1919,              // Or any open port
    proxy: {
      '/api': 'http://localhost:3001'
    },
    allowedHosts: ['cs144.org']
  }
});
