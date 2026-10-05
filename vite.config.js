import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Inline the entry stylesheet into index.html so it no longer blocks first render
// with an extra round trip. Lazy-route CSS chunks are left as files.
const inlineEntryCss = () => ({
  name: 'inline-entry-css',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html, { bundle }) {
      return html.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (tag, file) => {
        const asset = bundle?.[file]
        if (!asset || asset.type !== 'asset') return tag
        delete bundle[file]
        return `<style>${asset.source}</style>`
      })
    },
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), inlineEntryCss(),
    VitePWA({
      // A new deploy waits until the user taps "Muat ulang" in UpdateToast
      registerType: 'prompt',
      // Registered from src/composables/useAppUpdate.js via virtual:pwa-register
      injectRegister: false,
      workbox: {
        cleanupOutdatedCaches: true,
      },
    })
  ],
})
