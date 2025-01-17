import './assets/main.css'
import * as VueRouter from 'vue-router'

import { createApp } from 'vue/dist/vue.esm-bundler'
import { createPinia } from 'pinia'
import ScoreCard from './ScoreCard.vue'
import ScoreHistory from './ScoreHistory.vue'
import DataManagement from '@/DataManagement.vue'
import Toast from 'vue-toastification'

import 'vue-toastification/dist/index.css'
import ViewShoot from '@/ViewShoot.vue'
import UserData from "@/UserData.vue";
import { registerSW } from "virtual:pwa-register";
import DataMenuItem from "@/components/DataMenuItem.vue";
import MainNavigation from "./components/UserNavigation.vue";

const routes = [
  { path: '/', component: ScoreCard },
  { path: '/history', component: ScoreHistory },
  { path: "/data", component: DataManagement, title: DataMenuItem },
  { path: '/history/:id', name: 'viewHistory', component: ViewShoot },
  { path: "/you", name: "You", component: UserData }
]
const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

const intervalMS = 60 * 60 * 1000;

if ("serviceWorker" in navigator) {
  registerSW({
    onRegistered(r) {
      r && setInterval(() => {
        r.update();
      }, intervalMS);
    }
  });
}


const app = createApp({
  template: `
    <MainNavigation />
    <router-view></router-view>
  `
});
app.use(router)
app.component("MainNavigation", MainNavigation);
app.use(createPinia())
app.use(Toast, {})


app.mount('#app')
