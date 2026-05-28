import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url' 

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))  
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/petabencana': {
        target: 'https://data.petabencana.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/petabencana/, '')
      },
      '/bmkg': {
        target: 'https://data.bmkg.go.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bmkg/, '')
      }
    }
  }
})