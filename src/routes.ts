import * as VueRouter from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import ScoreCard from './ScoreCard.vue'
import DataMenuItem from '@/components/DataMenuItem.vue'

export const routes = [
  { path: '/', component: ScoreCard },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('./Leaderboard.vue')
  },
  {
    path: '/viewer/:joincode?',
    name: 'viewer', 
    component: () => import('./LiveScoreViewer.vue')
  },
  {
    path: '/history',
    component: () => import('./ScoreHistory.vue')
  },
  {
    path: '/diary',
    name: 'diary',
    component: () => import('./DiaryPage.vue')
  },
  {
    path: '/data',
    component: () => import('./DataManagement.vue'),
    title: DataMenuItem
  },
  {
    path: '/history/:id',
    name: 'viewHistory',
    component: () => import('./ViewShoot.vue')
  },
  {
    path: '/you',
    name: 'You',
    component: () => import('./UserData.vue')
  },
  {
    path: '/sight-marks',
    name: 'sight-marks',
    component: () => import('./components/sight_marks/SightMarksPage.vue')
  },
  {
    path: '/select-round',
    name: 'selectRound',
    component: () => import('./views/RoundSelectionPage.vue'),
    props: (route: RouteLocationNormalized) => ({
      returnTo: route.query.returnTo || '/',
      currentRound: route.query.currentRound || ''
    })
  },
  {
    path: '/admin/backups',
    name: 'backupDebugger',
    component: () => import('./components/admin/BackupDebugger.vue')
  },
  {
    path: '/participant-scorecard/:shootCode/:participantId',
    name: 'participantScorecard',
    component: () => import('./views/ParticipantScorecard.vue')
  }
]

export function createRouter() {
  const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
  })

  router.beforeEach((to, from, next) => {
    if (to.path.startsWith('/data/classifications')) {
      return false
    }
    next()
  })

  return router
}
