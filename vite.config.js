import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
})*/

// vite.config.js

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 這裡是你的後端 server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 保持 /api 路徑
      },
    },
  },
});