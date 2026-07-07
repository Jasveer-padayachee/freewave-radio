import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'freewave-radio'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'FreeWave Radio',
        short_name: 'FreeWave',
        description: 'Free internet radio streaming - search and play any online radio station',
        theme_color: '#0b0f14',
        background_color: '#0b0f14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Don't try to precache/intercept audio streams or API calls - they are
        // live network resources, not static app assets.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.includes('api.radio-browser.info'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'radio-browser-api',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 }
            }
          }
        ],
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
})
