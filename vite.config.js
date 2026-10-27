import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  /* 部署到客服站的站内子路径（/experience/）时，用 VITE_BASE 指定基础路径，资源与路由都跟着走 */
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5175',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5175',
        changeOrigin: true,
      },
    },
  },
})
