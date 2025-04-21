import './assets/main.css'
import * as VueRouter from 'vue-router'

import { createApp } from 'vue/dist/vue.esm-bundler'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { createPinia } from 'pinia'
import ScoreCard from './ScoreCard.vue'
import Toast from 'vue-toastification'

import 'vue-toastification/dist/index.css'
import { registerSW } from "virtual:pwa-register";
import DataMenuItem from "@/components/DataMenuItem.vue";
import MainNavigation from "./components/UserNavigation.vue";
import { useToast } from "vue-toastification";

const toast = useToast();

const routes = [
  { path: '/', component: ScoreCard },
  {
    path: "/history",
    component: () => import("./ScoreHistory.vue")
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
  // Add the new route for round selection
  {
    path: "/select-round",
    name: "selectRound",
    component: () => import("./views/RoundSelectionPage.vue"),
    props: route => ({
      returnTo: route.query.returnTo || "/",
      currentRound: route.query.currentRound || ""
    })
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
      toast.success("App ready for offline use");
    },
    onNeedRefresh() {
      toast.info("Updating to new version...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  })
}

const app = createApp({
  template: `
    <div class="app-container">
      <div class="content-area">
        <router-view></router-view>
      </div>
      <MainNavigation />
    </div>
  `
});
app.use(router)
app.use(VueVirtualScroller)
app.component("MainNavigation", MainNavigation);
app.use(createPinia())
app.use(Toast, {})

app.mount('#app')
