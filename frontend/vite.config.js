import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Only use proxy in development
  server: {
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/api': { 
        target: 'http://localhost:8000', 
        changeOrigin: true 
      }
    } : undefined
  }
})