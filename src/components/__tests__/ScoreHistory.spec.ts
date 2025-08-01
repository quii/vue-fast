import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ScoreHistory from '@/ScoreHistory.vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { routes } from '@/routes'
import Toast from 'vue-toastification'

// Import the actual classification data
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the classification data file
const seniorRecurveMenDataPath = path.resolve(__dirname, '../../../public/data/classifications/Men/Recurve/Senior.json')
const seniorRecurveMenData = JSON.parse(fs.readFileSync(seniorRecurveMenDataPath, 'utf8'))

// Define interfaces for our data structures
interface HistoryItem {
  id: string
  date: string
  gameType: string
  score: number
  isPB: boolean
  classification: string
  shootStatus: string
  scores: number[]
}

// Sample history data for testing
const mockHistoryData: HistoryItem[] = [
  {
    id: '1',
    date: '2023-01-01',
    gameType: 'bray i',
    score: 90,
    isPB: false,
    classification: 'A3',
    shootStatus: 'completed',
    scores: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    id: '2',
    date: '2023-01-02',
    gameType: 'bray ii',
    score: 180,
    isPB: true,
    classification: 'B2',
    shootStatus: 'completed',
    scores: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
  },
  {
    id: '3',
    date: '2023-01-03',
    gameType: 'bray i',
    score: 180,
    isPB: false,
    classification: 'B1',
    shootStatus: 'completed',
    scores: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
  },
  {
    id: '4',
    date: '2023-01-04',
    gameType: 'bray i',
    score: 270,
    isPB: true,
    classification: 'A1',
    shootStatus: 'completed',
    scores: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
  }
]

// Define interface for user profile
interface UserProfile {
  ageGroup: string
  gender: string
  bowType: string
  indoorClassifications: Record<string, string>
  outdoorClassifications: Record<string, string>
  indoorSeasonStartDate: string
  outdoorSeasonStartDate: string
  name: string
  constructiveCriticism: boolean
  experimentalTargetFace: boolean
  knockColor: string
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

describe('ScoreHistory.vue', () => {
  let wrapper: VueWrapper
  let mockStorage: MockStorage
  let router: Router
  let originalFetch: typeof global.fetch

  beforeEach(async () => {
    // Store the original fetch function
    originalFetch = global.fetch

    // Mock the fetch function
    global.fetch = vi.fn((url) => {
      // Extract the path from the URL
      const urlPath = url.toString().replace(/^(https?:\/\/[^\/]+)?/, '')

      // Check if this is the specific classification data request for Men/Recurve/Senior
      if (urlPath === '/data/classifications/Men/Recurve/Senior.json') {
        // Return the actual data from the file
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(seniorRecurveMenData)
        })
      }

      // For any other requests, return a 404
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      })
    })

    // Create a fresh mock localStorage for each test
    mockStorage = new MockStorage()
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    })

    // Set up user profile in localStorage
    const userProfile: UserProfile = {
      "ageGroup": "senior",
      "gender": "male",
      "bowType": "recurve",
      "indoorClassifications": { "recurve": "Unclassified" },
      "outdoorClassifications": { "recurve": "Unclassified" },
      "indoorSeasonStartDate": "2023-10-01",
      "outdoorSeasonStartDate": "2023-04-01",
      "name": "Test Archer",
      "constructiveCriticism": true,
      "experimentalTargetFace": false,
      "knockColor": "#FF69B4"
    }
    mockStorage.setItem('user', JSON.stringify(userProfile))

    // Set up history data in localStorage
    mockStorage.setItem('history', JSON.stringify(mockHistoryData))

    // Disable all tips
    mockStorage.setItem('hasSeenPrintTip', 'true')
    mockStorage.setItem('hasSeenHistoryTip', 'true')
    mockStorage.setItem('hasSeenRoundSelectionTip', 'true')
    mockStorage.setItem('hasSeenScoreCardTutorial', 'true')
    mockStorage.setItem('hasSeenInstallPrompt', 'true')

    // Create a router with memory history
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })

    // Mount the component with all necessary plugins
    wrapper = mount(ScoreHistory, {
      global: {
        plugins: [createPinia(), router, Toast],
        stubs: {
          'UnifiedGraphModal': true,
          'ClassificationProgress': true
        }
      }
    })

    // Wait for router to be ready
    await router.isReady()
  })

  afterEach(() => {
    // Restore the original fetch function
    global.fetch = originalFetch
    wrapper.unmount()
  })

  it('shows all history items by default', async () => {
    // Wait for component to load data
    await vi.dynamicImportSettled()

    // Check that all history items are displayed
    const historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(4)
  })

  it('filters by PB when PB filter is toggled', async () => {
    // Wait for component to load data
    await vi.dynamicImportSettled()

    // Find and click the PB filter button
    const pbFilterButtons = wrapper.findAll('button')
    const pbFilterButton = pbFilterButtons.find(button =>
      button.find('.filter-label').text().includes('PB')
    )
    await pbFilterButton.trigger('click')

    // Check that only PB items are displayed
    const historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(2)

    // Verify the correct items are shown
    expect(historyCards[0].text()).toContain('270')
    expect(historyCards[1].text()).toContain('180')
  })

  it('filters by round when a round is selected', async () => {
    // Wait for component to load data
    await vi.dynamicImportSettled()

    // Find and click the Round filter button
    const filterButtons = wrapper.findAll('button')
    const roundFilterButton = filterButtons.find(button =>
      button.find('.filter-label').text().includes('Round')
    )
    await roundFilterButton.trigger('click')

    // Find and click the Bray I option in the modal
    const roundButtons = wrapper.findAll('.round-buttons button')
    const brayIOption = roundButtons.find(button => button.text().includes('Bray I'))
    await brayIOption.trigger('click')

    // Check that only Bray I items are displayed
    const historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(3)

    // Verify all cards are for Bray I
    historyCards.forEach(card => {
      expect(card.text()).toContain('Bray I')
      expect(card.text()).not.toContain('Bray II')
    })
  })

  it('combines multiple filters', async () => {
    // Wait for component to load data
    await vi.dynamicImportSettled()

    // Apply round filter
    const filterButtons = wrapper.findAll('button')
    const roundFilterButton = filterButtons.find(button =>
      button.find('.filter-label').text().includes('Round')
    )
    await roundFilterButton.trigger('click')

    const roundButtons = wrapper.findAll('.round-buttons button')
    const brayIOption = roundButtons.find(button => button.text().includes('Bray I'))
    await brayIOption.trigger('click')

    // Apply PB filter
    const pbFilterButton = wrapper.findAll('button').find(button =>
      button.find('.filter-label').text().includes('PB')
    )
    await pbFilterButton.trigger('click')

    // Check that only Bray I PB items are displayed
    const historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(1)

    // Verify it's the correct item
    expect(historyCards[0].text()).toContain('Bray I')
    expect(historyCards[0].text()).toContain('270')
  })

  it('resets all filters when reset is clicked', async () => {
    // Wait for component to load data
    await vi.dynamicImportSettled()

    // Apply some filters
    const filterButtons = wrapper.findAll('button')
    const roundFilterButton = filterButtons.find(button =>
      button.find('.filter-label').text().includes('Round')
    )
    await roundFilterButton.trigger('click')

    const roundButtons = wrapper.findAll('.round-buttons button')
    const brayIOption = roundButtons.find(button => button.text().includes('Bray I'))
    await brayIOption.trigger('click')

    // Verify filter is applied
    let historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(3)

    // Click reset button
    const resetButton = wrapper.findAll('button').find(button => button.text().includes('Reset'))
    await resetButton.trigger('click')

    // Verify all items are shown again
    historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(4)
  })

  it('persists filters when navigating away and back', async () => {
    // Wait for component to load data
    await vi.dynamicImportSettled()

    // Apply round filter
    const filterButtons = wrapper.findAll('button')
    const roundFilterButton = filterButtons.find(button =>
      button.find('.filter-label').text().includes('Round')
    )
    await roundFilterButton.trigger('click')

    const roundButtons = wrapper.findAll('.round-buttons button')
    const brayIOption = roundButtons.find(button => button.text().includes('Bray I'))
    await brayIOption.trigger('click')

    // Verify filter is applied
    let historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(3)

    // Click on a history item to navigate to detail view
    await historyCards[0].trigger('click')

    // Navigate back to history page
    await router.go(-1)
    await vi.dynamicImportSettled()

    // Verify filter is still applied
    historyCards = wrapper.findAll('.history-card')
    expect(historyCards.length).toBe(3)

    // Verify the Round filter button shows as active
    const activeRoundFilter = wrapper.findAll('button.active').find(button =>
      button.find('.filter-label').text().includes('Round')
    )
    expect(activeRoundFilter.exists()).toBe(true)
  })
})