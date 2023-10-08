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

const routes = [
  { path: '/', component: ScoreCard },
  { path: '/history', component: ScoreHistory },
  { path: '/data', component: DataManagement },
  { path: '/history/:id', name: 'viewHistory', component: ViewShoot },
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

const app = createApp({})
app.use(router)

app.use(createPinia())
app.use(Toast, {})

app.mount('#app')
