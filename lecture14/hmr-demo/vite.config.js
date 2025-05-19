import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite should not be exposed to the Internet since it is a dev server
// we only do it here for demo purposes
export default defineConfig({
  plugins: [react()],
  server: {
    port: 1919,
    host: true,
    // not required for most use cases
    allowedHosts: ['cs144.org']
  }
})
