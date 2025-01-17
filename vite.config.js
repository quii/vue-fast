import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
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
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
