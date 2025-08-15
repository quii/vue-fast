/**
 * Tests for 252 Achievement System
 */

import { describe, test, expect, vi } from 'vitest';
import { 
  TWO_FIFTY_TWO_ACHIEVEMENTS, 
  check252At50ydAchieved,
  check252At60ydAchieved 
} from './two_fifty_two_awards';
import type { AchievementContext } from './types';

// Mock the round config manager
vi.mock('../scoring/game_types', () => ({
  roundConfigManager: {
    getConfig: vi.fn((roundName: string) => {
      const configs = {
        'windsor 50': {
          isImperial: true,
          isOutdoor: true,
          maxDistanceYards: 50,
          otherDistancesYards: [40, 30],
          distancesRoundSizes: [3, 3, 3], // 3 dozen at each distance
          endSize: 6
        },
        'national': {
          isImperial: true,
          isOutdoor: true,
          maxDistanceYards: 60,
          otherDistancesYards: [50],
          distancesRoundSizes: [4, 2], // 4 dozen at 60yd, 2 dozen at 50yd
          endSize: 6
        },
        'wa 70m': {
          isImperial: false,
          isOutdoor: true,
          maxDistanceMetres: 70,
          distancesRoundSizes: [6],
          endSize: 6
        }
      };
      return configs[roundName as keyof typeof configs];
    })
  }
}));

describe('252 Achievement System', () => {
  test('generates 8 achievements for imperial distances with correct tiers', () => {
    expect(TWO_FIFTY_TWO_ACHIEVEMENTS).toHaveLength(8);
    
    const expectedTiers = {
      10: 'bronze',
      20: 'bronze', 
      30: 'bronze',
      40: 'silver',
      50: 'silver', 
      60: 'gold',
      80: 'gold',
      100: 'diamond'
    };
    
    Object.entries(expectedTiers).forEach(([distance, expectedTier]) => {
      const achievement = TWO_FIFTY_TWO_ACHIEVEMENTS.find(a => a.id === `two_fifty_two_at_${distance}yd`);
      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe(`252 at ${distance}yd`);
      expect(achievement?.tier).toBe(expectedTier);
      expect(achievement?.targetScore).toBe(252);
    });
  });

  test('check252At50ydAchieved - achievement in Windsor 50 round', () => {
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
          // First 3 dozen at 50yd (arrows 0-35) - total 252
          9, 8, 7, 9, 8, 7,  // End 1: 48
          9, 8, 7, 9, 8, 7,  // End 2: 48  
          9, 8, 7, 9, 8, 7,  // End 3: 48
          9, 8, 7, 9, 8, 7,  // End 4: 48
          9, 8, 7, 9, 8, 7,  // End 5: 48
          8, 8, 6, 6, 6, 6,  // End 6: 40 (Total so far: 280, but we only count first 36 arrows)
          
          // Next 3 dozen at 40yd (arrows 36-71)
          5, 5, 5, 5, 5, 5,  
          5, 5, 5, 5, 5, 5,
          // ... more arrows
        ],
        totalArrows: 108,
        totalScore: 800,
        endCount: 18
      }]
    };

    const result = check252At50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(280); // First 36 arrows total
    expect(result.targetScore).toBe(252);
    expect(result.unlockedAt).toBe('2023-01-01');
  });

  test('check252At60ydAchieved - achievement in National round', () => {
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
          // First 3 dozen at 60yd (arrows 0-35) - score 252 exactly
          7, 7, 7, 7, 7, 7,  // End 1: 42
          7, 7, 7, 7, 7, 7,  // End 2: 42
          7, 7, 7, 7, 7, 7,  // End 3: 42
          7, 7, 7, 7, 7, 7,  // End 4: 42
          7, 7, 7, 7, 7, 7,  // End 5: 42
          7, 7, 7, 7, 7, 7,  // End 6: 42 (Total: 252)
          
          // Fourth dozen at 60yd (arrows 36-47) - not counted for achievement
          6, 6, 6, 6, 6, 6,  // End 7: 36
          6, 6, 6, 6, 6, 6,  // End 8: 36
          
          // 2 dozen at 50yd (arrows 48-71)
          5, 5, 5, 5, 5, 5,  
          // ... more arrows
        ],
        totalArrows: 72,
        totalScore: 500,
        endCount: 12
      }]
    };

    const result = check252At60ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(252);
    expect(result.targetScore).toBe(252);
    expect(result.unlockedAt).toBe('2023-01-01');
  });

  test('check252At50ydAchieved - cannot achieve in National round (only 2 dozen at 50yd)', () => {
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
          // 4 dozen at 60yd (arrows 0-47)
          ...Array(48).fill(7),
          
          // 2 dozen at 50yd (arrows 48-71) - perfect score but only 2 dozen
          9, 9, 9, 9, 9, 9,  // End: 54
          9, 9, 9, 9, 9, 9,  // End: 54
          9, 9, 9, 9, 9, 9,  // End: 54
          9, 9, 9, 9, 9, 9,  // End: 54 (Total at 50yd: 216, but only 24 arrows)
        ],
        totalArrows: 72,
        totalScore: 552,
        endCount: 12
      }]
    };

    const result = check252At50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(0); // Cannot be achieved with only 2 dozen
    expect(result.targetScore).toBe(252);
  });

  test('check252At50ydAchieved - not imperial round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        scores: Array(72).fill(9), // Perfect score on metric round
        totalArrows: 72,
        totalScore: 648,
        endCount: 12
      }]
    };

    const result = check252At50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(0);
    expect(result.targetScore).toBe(252);
  });

  test('check252At50ydAchieved - current shoot in progress', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [
          // Current shoot: first 2 dozen at 50yd in Windsor 50
          9, 9, 8, 8, 7, 7,  // End 1: 48
          9, 9, 8, 8, 7, 7,  // End 2: 48
          9, 9, 8, 8, 7, 7,  // End 3: 48
          9, 9, 8, 8, 7, 7,  // End 4: 48 (Total so far: 192 in 24 arrows)
        ],
        gameType: 'windsor 50'
      },
      shootHistory: []
    };

    const result = check252At50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(192); // Current progress
    expect(result.targetScore).toBe(252);
  });

  test('handles missing scores and invalid scores', () => {
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
          // Mix of valid scores, misses, and edge cases
          9, 'M', 8, null, 7, undefined,  // End 1: 24 (9+0+8+0+7+0)
          9, 8, 'X', 9, 8, 7,             // End 2: 41 (assuming X=0 for imperial)
          // ... not enough for full 3 dozen
        ],
        totalArrows: 12,
        totalScore: 65,
        endCount: 2
      }]
    };

    const result = check252At50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBeLessThan(252);
    expect(result.targetScore).toBe(252);
  });
});
