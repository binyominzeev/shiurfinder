import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['sf.vidfaq.com'], // 👈 add your domain here
    proxy: {
      '/api': {
        target: 'http://sf.vidfaq.com:5002',
        changeOrigin: true,
      },
    },
  },
})
