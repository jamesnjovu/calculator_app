import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

const copyPWAAssets = () => {
  return {
    name: 'copy-pwa-assets',
    writeBundle() {
      const publicDir = resolve('public')
      const outDir = resolve('dist')

      // Ensure the icons directory exists
      const iconsOutDir = resolve(outDir, 'icons')
      if (!fs.existsSync(iconsOutDir)) {
        fs.mkdirSync(iconsOutDir, { recursive: true })
      }

      // Copy manifest
      if (fs.existsSync(resolve(publicDir, 'manifest.json'))) {
        fs.copyFileSync(
          resolve(publicDir, 'manifest.json'),
          resolve(outDir, 'manifest.json')
        )
      }

      // Copy service worker
      if (fs.existsSync(resolve(publicDir, 'sw.js'))) {
        fs.copyFileSync(
          resolve(publicDir, 'sw.js'),
          resolve(outDir, 'sw.js')
        )
      }

      // Copy icons directory if it exists
      const iconsDir = resolve(publicDir, 'icons')
      if (fs.existsSync(iconsDir)) {
        const icons = fs.readdirSync(iconsDir)
        icons.forEach(icon => {
          fs.copyFileSync(
            resolve(iconsDir, icon),
            resolve(iconsOutDir, icon)
          )
        })
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyPWAAssets(),],
  base: '/calculator_app/',
})
