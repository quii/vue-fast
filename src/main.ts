import './assets/main.css'
import * as VueRouter from 'vue-router'

import { createApp } from 'vue/dist/vue.esm-bundler'
import DevTools from '@/components/DevTools.vue'
import { createPinia } from 'pinia'
import ScoreCard from './ScoreCard.vue'
import Toast from 'vue-toastification'
import InstallBanner from './components/InstallBanner.vue'

import 'vue-toastification/dist/index.css'
import { registerSW } from "virtual:pwa-register";
import DataMenuItem from "@/components/DataMenuItem.vue";
import MainNavigation from "./components/UserNavigation.vue";
import { useToast } from "vue-toastification";
import { useInstallationStore } from './stores/installation'
import { backupService } from './services/backupService'

const toast = useToast();

const routes = [
  { path: '/', component: ScoreCard },
  {
    path: "/history",
    component: () => import("./ScoreHistory.vue")
  },
  {
    path: '/diary',
    name: 'diary',
    component: () => import('./DiaryPage.vue')
  },
  {
    path: "/data",
    component: () => import("./DataManagement.vue"),
    title: DataMenuItem
  },
  {
    path: "/history/:id",
    name: "viewHistory",
    component: () => import("./ViewShoot.vue")
  },
  {
    path: "/you",
    name: "You",
    component: () => import("./UserData.vue")
  },
  {
    path: "/sight-marks",
    name: "sight-marks",
    component: () => import("./components/sight_marks/SightMarksPage.vue")
  },
  {
    path: "/select-round",
    name: "selectRound",
    component: () => import("./views/RoundSelectionPage.vue"),
    props: route => ({
      returnTo: route.query.returnTo || "/",
      currentRound: route.query.currentRound || ""
    })
  },
  // Add the new route for the backup debugger (hidden from navigation)
  {
    path: '/admin/backups',
    name: 'backupDebugger',
    component: () => import('./components/admin/BackupDebugger.vue')
  }
]
const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path.startsWith("/data/classifications")) {
    return false;
  }
  next();
})
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
