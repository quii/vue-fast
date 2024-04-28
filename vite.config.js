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
      manifest: {
        name: "Archery Score Keeper v4",
        short_name: "Archery Score Keeper",
        description: "A simple score keeper for archery",
        theme_color: "teal",
        orientation: "any",
        icons: [
          {
            src: "/public/icon.png",
            sizes: "150x150",
            type: "image/png",
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
