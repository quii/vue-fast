import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        // Exclude API routes from being cached by the service worker
        navigateFallbackDenylist: [/^\/api\//]
      },
      manifest: {
        name: "Fast v6",
        short_name: "Fast",
        description: "A simple score keeper for archery",
        theme_color: "white",
        orientation: "any",
        icons: [
          {
            src: "icon.png",
            sizes: "150x150",
            type: "image/png",
          },
          {
            src: "icon_small.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icon_large.png",
            sizes: "512x570",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url))
    }
  },
  // Configure the dev server to proxy API requests and WebSocket connections to our backend server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      // Add WebSocket proxy
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true, // Enable WebSocket proxying
        changeOrigin: true,
        secure: false
      }
    }
  },
  publicDir: "public",
  assetsInclude: ["**/*.json"],
  json: {
    stringify: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    // other test configuration...
  },
});
