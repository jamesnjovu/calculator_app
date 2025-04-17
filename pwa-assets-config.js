import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
    preset: {
        transparent: {
            sizes: [64, 72, 96, 128, 144, 152, 192, 384, 512],
            favicons: [[48, 'favicon.ico']],
            padding: 0,
        },
        maskable: {
            sizes: [512],
            padding: 0.1,
        },
        apple: {
            sizes: [180],
            padding: 0.1,
        },
    },
    images: ['public/calculator-icon.png'],
    outDir: 'public/icons',
})
