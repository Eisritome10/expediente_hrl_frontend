import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Para probar desde el teléfono con un túnel (ngrok): el servidor acepta ese dominio y reenvía /api al
    // backend local, así basta un solo túnel y el frontend usa VITE_API_URL=/api/v1 (misma URL, sin CORS).
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'],
    proxy: {
      '/api': { target: 'http://localhost:3002', changeOrigin: true },
    },
  },
})
