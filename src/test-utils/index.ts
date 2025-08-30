/**
 * Main testing utilities export
 * Provides a complete toolkit for testing Vue components with dependency injection
 */

import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { routes } from '@/routes'
import {
  createFakeScoresStore,
  createFakeGameTypeStore,
  createFakeUserStore,
  createFakeHistoryStore,
  createFakeNotesStore,
  createFakeArrowHistoryStore,
  createFakePreferencesStore,
  createFakeShootStore,
  createFakeShootTimingStore,
  createFakeAchievementStore
} from './fake-stores'

// Export all fake stores for individual use
export * from './fake-stores'

// Create a complete test environment setup
export function createTestEnvironment() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  const pinia = createPinia()

  const fakeStores = {
    scoresStore: createFakeScoresStore(),
    gameTypeStore: createFakeGameTypeStore(),
    userStore: createFakeUserStore(),
    historyStore: createFakeHistoryStore(),
    notesStore: createFakeNotesStore(),
    arrowHistoryStore: createFakeArrowHistoryStore(),
    preferencesStore: createFakePreferencesStore(),
    shootStore: createFakeShootStore(),
    shootTimingStore: createFakeShootTimingStore(),
    achievementStore: createFakeAchievementStore()
  }

  return {
    router,
    pinia,
    fakeStores,
    // Provide configuration for Vue Test Utils
    mountOptions: {
      global: {
        plugins: [router, pinia],
        provide: fakeStores
      }
    }
  }
}

// Test data helpers
export const testData = {
  ruthsGame: [
    9, 9, 9, 8, 7, 6,  // End 1
    9, 9, 8, 8, 7, 7,  // End 2
    9, 8, 8, 7, 7, 6,  // End 3
    9, 9, 9, 8, 8, 7,  // End 4
    10, 9, 9, 8, 7, 6, // End 5
    9, 9, 8, 8, 7, 7,  // End 6
    // Continue with more test data...
  ],
  
  // Quick test data for faster tests
  shortGame: [
    10, 9, 8, 7, 6, 5,  // End 1 - Total: 45
    9, 8, 7, 6, 5, 4,   // End 2 - Total: 39
    8, 7, 6, 5, 4, 3    // End 3 - Total: 33
    // Total: 117
  ]
}

// Helper to set up specific game scenarios
export function setupGameScenario(fakeStores: ReturnType<typeof createTestEnvironment>['fakeStores'], scenario: 'imperial' | 'metric' | 'practice') {
  switch (scenario) {
    case 'imperial':
      fakeStores.gameTypeStore.setGameType('Windsor')
      break
    case 'metric':
      fakeStores.gameTypeStore.setGameType('WA 70m')
      break
    case 'practice':
      fakeStores.gameTypeStore.setGameType('Practice - 20 arrows')
      break
  }
}

// Helper to simulate scoring arrows
export function simulateScoring(scoresStore: ReturnType<typeof createFakeScoresStore>, scores: (number | string)[]) {
  scores.forEach(score => {
    scoresStore.add(score)
  })
}

// Helper to create a completed shoot in history
export function createTestShoot(historyStore: ReturnType<typeof createFakeHistoryStore>, options: {
  gameType?: string
  score?: number
  date?: string
} = {}) {
  const {
    gameType = 'Windsor',
    score = 500,
    date = new Date().toISOString()
  } = options

  const userProfile = {
    gender: 'male' as const,
    ageGroup: 'senior' as const,
    bowType: 'recurve' as const,
    classification: 'Unclassified'
  }

  return historyStore.add(
    date,
    score,
    gameType,
    Array(18).fill(8), // Mock 18 arrows of score 8
    'yards',
    userProfile,
    'Competition'
  )
}

// Export common assertions for components
export const assertions = {
  expectTotalScore(element: any, expectedScore: number | string) {
    expect(element.text()).toContain(expectedScore.toString())
  },
  
  expectElementExists(element: any, description: string) {
    expect(element.exists(), `${description} should exist`).toBe(true)
  },
  
  expectElementNotExists(element: any, description: string) {
    expect(element.exists(), `${description} should not exist`).toBe(false)
  }
}