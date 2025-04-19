import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addHandicapToHistory, createHandicapCalculator } from './handicap'

// Mock the fetch function
global.fetch = vi.fn()

describe('handicap functions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()

    // Mock the fetch response for handicap data
    // Using arrays that match the actual logic in createHandicapCalculator
    const mockHandicapData = {
      'national 40': [300, 350, 400, 450, 500, 550],
      'portsmouth': [400, 450, 500, 550, 580, 590]
    }

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(mockHandicapData)
    })
  })

  describe('addHandicapToHistory', () => {
    it('should preserve existing handicap values', async () => {
      // Arrange
      const scoringHistory = [
        {
          id: 1,
          gameType: 'national 40',
          score: 420,
          handicap: 2 // Existing handicap
        },
        {
          id: 2,
          gameType: 'portsmouth',
          score: 520,
          handicap: 3 // Existing handicap
        }
      ]

      // Act
      const result = await addHandicapToHistory(scoringHistory)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].handicap).toBe(2) // Should preserve the existing handicap
      expect(result[1].handicap).toBe(3) // Should preserve the existing handicap

      // Verify fetch was not called since we already have handicaps
      expect(fetch).not.toHaveBeenCalled()
    })


    it('should handle empty history array', async () => {
      // Arrange
      const scoringHistory = []

      // Act
      const result = await addHandicapToHistory(scoringHistory)

      // Assert
      expect(result).toEqual([])
      expect(fetch).not.toHaveBeenCalled()
    })
  })
})