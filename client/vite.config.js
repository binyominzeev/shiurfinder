import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['myshiurim.com'], // 👈 add your domain here
    proxy: {
      '/api': {
        target: 'http://myshiurim.com:5002',
        changeOrigin: true,
      },
    },
  },
})
