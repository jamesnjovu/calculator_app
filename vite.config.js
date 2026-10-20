import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/calculator_app/',
  build: {
    rollupOptions: {
      output: {
        // Keep the math library in its own long-lived cached chunk
        manualChunks: {
          mathjs: ['mathjs/number'],
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.{js,jsx}'],
  },
})
