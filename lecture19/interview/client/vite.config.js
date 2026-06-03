import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    },
    host: true,            // Allow connections from any IP
    port: 1919,            // Set your dev server port
    strictPort: true,      // Fail if 1919 is taken
    allowedHosts: ['cs144.org']  // Optional: restrict which hosts can connect
  }
});
