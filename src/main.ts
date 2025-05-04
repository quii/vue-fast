import './assets/main.css'

import { createApp } from 'vue/dist/vue.esm-bundler'
import DevTools from '@/components/DevTools.vue'
import { createPinia } from 'pinia'
import Toast, { useToast } from 'vue-toastification'
import InstallBanner from './components/InstallBanner.vue'

import 'vue-toastification/dist/index.css'
import { registerSW } from 'virtual:pwa-register'
import MainNavigation from './components/UserNavigation.vue'
import { useInstallationStore } from './stores/installation'
import { backupService } from './services/backupService'
import { createRouter, routes } from '@/routes'

const router = createRouter()
const intervalMS = 60 * 60 * 1000;

if ("serviceWorker" in navigator) {
  registerSW({
    immediate: true,
    onRegistered(r) {
      r && setInterval(() => {
        r.update();
      }, intervalMS);
    },
    onOfflineReady() {
    },
    onNeedRefresh() {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  })
}

// Set up backup event listener
window.addEventListener('archery-data-changed', (event) => {
  const customEvent = event as CustomEvent
  console.log('Data change detected:', customEvent.detail)
  backupService.scheduleBackup()
})

const pinia = createPinia()
const app = createApp({
  template: `
    <div class="app-container">
      <div class="content-area">
        <router-view></router-view>
      </div>
      <InstallBanner />
      <MainNavigation />
      <DevTools />
    </div>
  `
});
app.use(router)
app.use(pinia)
app.component("MainNavigation", MainNavigation);
app.component('InstallBanner', InstallBanner)
app.component('DevTools', DevTools)
app.use(Toast, {})

// Initialize the installation store
const installationStore = useInstallationStore()
installationStore.detectPlatform()

app.mount('#app')
