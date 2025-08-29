/**
 * Distance Performance Tests
 * 
 * Tests for distance performance analysis functionality
 */

import { describe, expect, test } from 'vitest'
import { analyzeDistancePerformance } from './distance_performance.js'

describe('Distance Performance Analysis', () => {
  test('calculates correct best end total (not average)', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2023-01-01',
        scores: [
          // First end: 54 total (9+9+9+9+9+9)
          9, 9, 9, 9, 9, 9,
          // Second end: 48 total (8+8+8+8+8+8) 
          8, 8, 8, 8, 8, 8,
          // Third end: 60 total (10+10+10+10+10+10) - This should be the best end
          10, 10, 10, 10, 10, 10,
          // Fourth end: 42 total (7+7+7+7+7+7)
          7, 7, 7, 7, 7, 7
        ],
        score: 204, // Total: 54 + 48 + 60 + 42
        gameType: 'practice 70m'
      }
    ]

    const result = analyzeDistancePerformance(shootHistory)
    const distance70m = result.distances.find(d => d.distance === 70)
    
    // Best end total should be 60 (the third end), not an average
    expect(distance70m?.bestEndTotal).toBe(60)
  })

  test('finds best end total across multiple shoots', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2023-01-01',
        scores: [
          // Best end in this shoot: 54 total
          9, 9, 9, 9, 9, 9,
          8, 8, 8, 8, 8, 8
        ],
        score: 102,
        gameType: 'practice 70m'
      },
      {
        id: 2,
        date: '2023-01-02', 
        scores: [
          // Best end in this shoot: 60 total - should be overall best
          10, 10, 10, 10, 10, 10,
          7, 7, 7, 7, 7, 7
        ],
        score: 102,
        gameType: 'practice 70m'
      }
    ]

    const result = analyzeDistancePerformance(shootHistory)
    const distance70m = result.distances.find(d => d.distance === 70)
    
    // Best end total should be 60 from the second shoot
    expect(distance70m?.bestEndTotal).toBe(60)
  })
})