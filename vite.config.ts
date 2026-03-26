// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2019',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          maps: ['leaflet', 'react-leaflet'],
          icons: ['lucide-react', 'react-icons'],
        }
      }
    }
  },
  // Force Vite to also transpile dependencies that ship modern syntax
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2019',
    }
  }
})