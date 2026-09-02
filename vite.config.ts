import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Appen publiceras som ett GitHub Pages-projekt under /KBT/.
// BASE_PATH kan overridas vid bygge for andra vardar (t.ex. '/' pa en egen doman).
const base = process.env.BASE_PATH ?? '/KBT/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'fonts/*.woff2'],
      manifest: {
        name: 'KBT – ditt eget arbetsrum',
        short_name: 'KBT',
        description:
          'Ett fritt, privat verktyg for kognitiv beteendeterapi. All data stannar pa din enhet.',
        lang: 'sv-SE',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#FBF8F4',
        theme_color: '#FBF8F4',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Ingen runtime-caching mot externa varden: appen gor inga externa anrop.
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
