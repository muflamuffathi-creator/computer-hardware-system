import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        // Use VITE_API_BASE_URL when provided (dev env), otherwise default to localhost:8080
        // If VITE_API_BASE_URL includes a trailing '/api', strip it so proxy target is the backend root.
        target: (process.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/(api)?\/?$/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
