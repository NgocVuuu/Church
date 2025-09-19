import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Allow overriding API port via env (VITE_API_PORT) to follow server auto-increment logic
  const apiPort = Number(process.env.VITE_API_PORT) || 5000
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
