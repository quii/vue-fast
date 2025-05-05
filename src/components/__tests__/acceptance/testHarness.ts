import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, afterEach, vi } from 'vitest'
import { createRouter } from 'vue-router'
import { routes } from '@/routes'
import { createServer } from './mockServer'
import { createPinia } from 'pinia'
import App from '@/App.vue' // Import the actual App component
import { createMemoryHistory } from 'vue-router'
import Toast from 'vue-toastification'

// Mock localStorage
class MockStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.store[key] = value
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }
}

// Create a global mock storage instance
export const mockStorage = new MockStorage()

// Setup default user profile
export function setupDefaultUserProfile() {
  const defaultUserProfile = {
    "ageGroup": "senior",
    "gender": "male",
    "bowType": "recurve",
    "indoorClassifications": { "recurve": "Unclassified" },
    "outdoorClassifications": { "recurve": "Unclassified" },
    "indoorSeasonStartDate": "2025-10-01",
    "outdoorSeasonStartDate": "2025-04-01",
    "name": "Test Archer",
    "constructiveCriticism": true,
    "experimentalTargetFace": false,
    "knockColor": "#FF69B4",
    "lastBackupDate": "2025-05-03T16:35:23.800Z"
  }

  mockStorage.setItem('user', JSON.stringify(defaultUserProfile))

  // Disable all tips
  mockStorage.setItem('hasSeenPrintTip', 'true')
  mockStorage.setItem('hasSeenHistoryTip', 'true')
  mockStorage.setItem('hasSeenRoundSelectionTip', 'true')
  mockStorage.setItem('hasSeenScoreCardTutorial', 'true')
  mockStorage.setItem('hasSeenInstallPrompt', 'true')
}

// Mock window.matchMedia
function setupMatchMediaMock() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock server for public assets
let server: ReturnType<typeof createServer>

// Setup function to mount the app and return the wrapper
export async function setupApp() {
  // Mock window.matchMedia before creating the app
  setupMatchMediaMock()

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true
  })

  // Setup default user profile
  setupDefaultUserProfile()

  // Create a router instance
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  // Create a pinia instance
  const pinia = createPinia()

  // Mount the App component directly
  const wrapper = mount(App, {
    global: {
      plugins: [router, pinia, Toast],
      stubs: {
        'DevTools': true
      }
    }
  })

  // Wait for router to be ready
  await router.isReady()

  // Navigate to the root route (score page)
  await router.push('/')
  await vi.dynamicImportSettled()

  return { wrapper, router, pinia }
}

// Setup and teardown hooks for tests
export function setupTestEnvironment() {
  beforeEach(async () => {
    // Start mock server for public assets
    server = createServer()
    await server.start()

    // Log that the server has started
    console.log('Mock server started for test')
  })

  afterEach(async () => {
    // Clean up
    mockStorage.clear()

    // Stop the mock server
    await server.stop()
    console.log('Mock server stopped after test')
  })
}