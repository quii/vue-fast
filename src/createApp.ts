import './assets/main.css'
import { createApp } from 'vue/dist/vue.esm-bundler'
import DevTools from '@/components/DevTools.vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import InstallBanner from './components/InstallBanner.vue'
import 'vue-toastification/dist/index.css'
import MainNavigation from './components/UserNavigation.vue'
import { useInstallationStore } from './stores/installation'
import { backupService } from './services/backupService'
import { createRouter, routes } from '@/routes'
import { useThemeStore } from '@/stores/theme'
import { BrowserSharingService } from '@/domain/adapters/browser/browser_sharing_service'
import { HttpShootService } from '@/services/HttpShootService'
import { BrowserLocationService } from '@/domain/adapters/browser/BrowserLocationService'
import {
  Chart,
  LineController,
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement
} from 'chart.js'

// Centralized Chart.js component registration
// Register all structural components globally once (safe for global registration)
// Note: Interactive plugins like Legend and Tooltip should be registered per-chart to avoid interference
function setupChartJS() {
  Chart.register(
    LineController,
    BarController,
    PieController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement
    // Deliberately excluding Legend and Tooltip - these should be registered per-chart
  )
}

export function setupServiceWorker() {
  const intervalMS = 60 * 60 * 1000;

  if ("serviceWorker" in navigator) {
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
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
      })
      .catch(error => {
        console.error('Failed to register service worker:', error)
      })
  }
}

export function setupBackupEventListener() {
  // Set up backup event listener
  window.addEventListener('archery-data-changed', (event) => {
    const customEvent = event as CustomEvent
    console.log('Data change detected:', customEvent.detail)
    backupService.scheduleBackup()
  })
}

export function createAppInstance() {
  // Set up Chart.js components globally once
  setupChartJS()
  
  const router = createRouter()
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

  // Set up client-side services
  const httpShootService = new HttpShootService()
  const locationService = new BrowserLocationService()
  
  // Provide services for dependency injection
  app.provide('sharingService', new BrowserSharingService())
  app.provide('shootService', httpShootService)
  app.provide('locationService', locationService)

  app.use(router)
  app.use(pinia)
  app.component("MainNavigation", MainNavigation);
  app.component('InstallBanner', InstallBanner)
  app.component('DevTools', DevTools)
  app.use(Toast, {})

  // Initialize the installation store
  const installationStore = useInstallationStore()
  installationStore.detectPlatform()

  // Initialize theme
  const themeStore = useThemeStore()
  themeStore.applyTheme()

  return { app, router, pinia }
}