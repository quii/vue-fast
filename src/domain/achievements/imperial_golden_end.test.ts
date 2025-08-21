/**
 * Imperial Golden End Achievement Tests
 * 
 * Tests for the 6 9s (54 points) in a single end at imperial distances
 */

import { describe, test, expect } from 'vitest';
import { 
  checkGoldenEndAt50ydAchieved,
  checkGoldenEndAt60ydAchieved,
  GOLDEN_END_ACHIEVEMENTS 
} from './imperial_golden_end.js';
import type { AchievementContext } from './types.js';

describe('Imperial Golden End Achievement System', () => {
  test('generates 8 achievements for imperial distances with correct tiers', () => {
    expect(GOLDEN_END_ACHIEVEMENTS).toHaveLength(8);
    
    const expectedTiers = {
      10: 'bronze',
      20: 'bronze', 
      30: 'bronze',
      40: 'silver',
      50: 'silver', 
      60: 'gold',
      80: 'diamond',
      100: 'diamond'
    };
    
    Object.entries(expectedTiers).forEach(([distance, expectedTier]) => {
      const achievement = GOLDEN_END_ACHIEVEMENTS.find(a => a.id === `golden_end_at_${distance}yd`);
      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe(`Golden End at ${distance}yd`);
      expect(achievement?.tier).toBe(expectedTier);
      expect(achievement?.targetScore).toBe(54);
    });
  });

  test('checkGoldenEndAt50ydAchieved - achievement in Windsor 50 round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'windsor 50'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'windsor 50',
        scores: [
          // First end at 50yd - golden end (6 9s)
          9, 9, 9, 9, 9, 9,  // End 1: 54 points
          8, 8, 8, 8, 8, 8,  // End 2: 48 points
          7, 7, 7, 7, 7, 7,  // End 3: 42 points
          // ... more ends
          8, 8, 8, 8, 8, 8,
          7, 7, 7, 7, 7, 7,
          6, 6, 6, 6, 6, 6,
        ]
      }]
    };

    const result = checkGoldenEndAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(54); // Best end score
    expect(result.targetScore).toBe(54);
    expect(result.unlockedAt).toBe('2023-01-01');
  });

  test('checkGoldenEndAt60ydAchieved - achievement in National round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'national'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'national',
        scores: [
          // First 4 dozen at 60yd (arrows 0-47)
          8, 8, 8, 8, 8, 8,  // End 1: 48
          9, 9, 9, 9, 9, 9,  // End 2: 54 (golden end!)
          7, 7, 7, 7, 7, 7,  // End 3: 42
          8, 8, 8, 8, 8, 8,  // End 4: 48
          7, 7, 7, 7, 7, 7,  // End 5: 42
          8, 8, 8, 8, 8, 8,  // End 6: 48
          7, 7, 7, 7, 7, 7,  // End 7: 42
          8, 8, 8, 8, 8, 8,  // End 8: 48
          
          // 2 dozen at 50yd (arrows 48-71)
          5, 5, 5, 5, 5, 5,  
          6, 6, 6, 6, 6, 6,
          7, 7, 7, 7, 7, 7,
          8, 8, 8, 8, 8, 8,
        ]
      }]
    };

    const result = checkGoldenEndAt60ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(54);
    expect(result.targetScore).toBe(54);
    expect(result.unlockedAt).toBe('2023-01-01');
  });

  test('checkGoldenEndAt50ydAchieved - not achieved, shows best attempt', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [
          // Current shoot: getting close but not quite there
          8, 8, 8, 8, 8, 8,  // End 1: 48
          9, 9, 9, 9, 8, 8,  // End 2: 52 (close!)
          7, 7, 7, 7, 7, 7,  // End 3: 42
        ],
        gameType: 'windsor 50'
      },
      shootHistory: []
    };

    const result = checkGoldenEndAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(52); // Best attempt so far
    expect(result.targetScore).toBe(54);
  });

  test('checkGoldenEndAt50ydAchieved - not imperial round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        score: 648,
        scores: Array(72).fill(9) // Perfect score on metric round
      }]
    };

    const result = checkGoldenEndAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(0);
    expect(result.targetScore).toBe(54);
  });

  test('handles X scores and misses correctly', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [
          // End with mixed scores including X and miss
          9, 9, 9, 9, 9, 'X',  // End 1: 9*5 + 10 = 55 (counts as golden end since X=10)
          8, 8, 8, 'M', 8, 8,  // End 2: 8*5 + 0 = 40
        ],
        gameType: 'windsor 50'
      },
      shootHistory: []
    };

    const result = checkGoldenEndAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true); // 55 >= 54
    expect(result.currentScore).toBe(55);
  });

  test('handles incomplete ends correctly', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [
          // Only partial end available
          9, 9, 9, 9 // Only 4 arrows of a 6-arrow end
        ],
        gameType: 'windsor 50'
      },
      shootHistory: []
    };

    const result = checkGoldenEndAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBeLessThan(54);
  });

  test('finds best end across multiple shoots', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'windsor 50'
      },
      shootHistory: [
        {
          id: 'test-shoot-1',
          date: '2023-01-01',
          gameType: 'windsor 50',
          score: 90,
          scores: [
            8, 8, 8, 8, 8, 8,  // End: 48
            7, 7, 7, 7, 7, 7,  // End: 42
          ]
        },
        {
          id: 'test-shoot-2',
          date: '2023-01-02',
          gameType: 'windsor 50',
          score: 89,
          scores: [
            9, 9, 9, 9, 9, 8,  // End: 53 (best so far, but not golden)
            6, 6, 6, 6, 6, 6,  // End: 36
          ]
        }
      ]
    };

    const result = checkGoldenEndAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(53); // Best across all shoots
    expect(result.targetScore).toBe(54);
  });
});
