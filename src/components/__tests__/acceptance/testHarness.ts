import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, afterEach, vi } from 'vitest'
import { createRouter } from 'vue-router'
import { routes } from '@/routes'
import { createServer } from './mockServer'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import { createMemoryHistory } from 'vue-router'
import Toast from 'vue-toastification'

// Create an enhanced wrapper that logs debug info when elements aren't found
function createEnhancedWrapper(wrapper: VueWrapper): VueWrapper {
  // Store the original find method
  const originalFind = wrapper.find
  const originalFindAll = wrapper.findAll

  // Override the find method
  wrapper.find = function(selector: string) {
    const result = originalFind.call(this, selector)

    // If the element wasn't found, log debug info
    if (!result.exists()) {
      console.error(`Element not found: "${selector}"`)
      console.log('Current path:', wrapper.vm.$route?.path || 'Unknown')
      console.log('Current HTML:')
      console.log(wrapper.html())
    }

    return result
  }

  // Override the findAll method to log when no elements are found
  wrapper.findAll = function(selector: string) {
    const results = originalFindAll.call(this, selector)

    // If no elements were found, log debug info
    if (results.length === 0) {
      console.error(`No elements found for: "${selector}"`)
      console.log('Current path:', wrapper.vm.$route?.path || 'Unknown')
      console.log('Current HTML:')
      console.log(wrapper.html())
    }

    return results
  }

  return wrapper
}

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

// Base class for page objects
export class BasePage {
  constructor(protected wrapper: VueWrapper) {}

  async waitForUpdate(): Promise<void> {
    await vi.dynamicImportSettled()
  }

  // Helper method to find elements by text content
  async findByText(text: string, selector = '*') {
    // Find all elements matching the selector
    const elements = this.wrapper.findAll(selector)

    // Filter to find the one containing the text
    for (const element of elements) {
      if (element.text().includes(text)) {
        return element
      }
    }

    // If no element was found, log debug info
    console.error(`No element found with text: "${text}" and selector: "${selector}"`)
    console.log('Current path:', this.wrapper.vm.$route?.path || 'Unknown')
    console.log('Current HTML:')
    console.log(this.wrapper.html())

    // Return an empty wrapper if not found
    return { exists: () => false } as any
  }

  // Get the current route path
  getCurrentPath(): string | null {
    if (this.wrapper.vm.$route) {
      return this.wrapper.vm.$route.path
    }
    return null
  }

  // Debug method to log the current HTML and route to the console
  debug(): void {
    const currentPath = this.getCurrentPath()
    console.log('=== DEBUG INFO ===')
    console.log(`Current path: ${currentPath || 'Unknown'}`)
    console.log('Current HTML:')
    console.log(this.wrapper.html())
    console.log('=== END DEBUG INFO ===')
  }

  // Navigate to a specific path
  async navigateTo(path: string) {
    await this.wrapper.vm.$router.push(path)
    await this.waitForUpdate()

    // Wait a bit longer to ensure the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

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
  let wrapper = mount(App, {
    global: {
      plugins: [router, pinia, Toast],
      stubs: {
        'DevTools': true
      }
    }
  })

  // Enhance the wrapper with our debug functionality
  wrapper = createEnhancedWrapper(wrapper)

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
    server = createServer()
    await server.start()
  })

  afterEach(async () => {
    mockStorage.clear()
    await server.stop()
  })
}