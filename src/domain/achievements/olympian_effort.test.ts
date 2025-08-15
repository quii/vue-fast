/**
 * Olympian Effort Achievement Tests
 * 
 * Tests for the 3-day consecutive arrow count achievements
 */

import { describe, test, expect } from 'vitest';
import { 
  checkOlympianEffortBronzeAchieved,
  checkOlympianEffortSilverAchieved,
  checkOlympianEffortGoldAchieved,
  checkOlympianEffortDiamondAchieved,
  OLYMPIAN_EFFORT_ACHIEVEMENTS 
} from './olympian_effort.js';
import type { AchievementContext } from './types.js';

describe('Olympian Effort Achievement System', () => {
  test('generates 4 achievements with correct tiers and thresholds', () => {
    expect(OLYMPIAN_EFFORT_ACHIEVEMENTS).toHaveLength(4);
    
    const expectedAchievements = [
      { id: 'olympian_effort_bronze', tier: 'bronze', targetArrows: 210 },
      { id: 'olympian_effort_silver', tier: 'silver', targetArrows: 375 },
      { id: 'olympian_effort_gold', tier: 'gold', targetArrows: 600 },
      { id: 'olympian_effort_diamond', tier: 'diamond', targetArrows: 900 }
    ];
    
    expectedAchievements.forEach(expected => {
      const achievement = OLYMPIAN_EFFORT_ACHIEVEMENTS.find(a => a.id === expected.id);
      expect(achievement).toBeDefined();
      expect(achievement?.tier).toBe(expected.tier);
      expect(achievement?.targetArrows).toBe(expected.targetArrows);
      expect(achievement?.name).toContain('Olympian Effort');
    });
  });

  test('checkOlympianEffortBronzeAchieved - achievement with 3 consecutive days', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        {
          id: 'day1',
          date: '2025-01-01',
          gameType: 'national',
          score: 420,
          scores: Array(72).fill(7) // 72 arrows on day 1
        },
        {
          id: 'day2',
          date: '2025-01-02', 
          gameType: 'national',
          score: 420,
          scores: Array(72).fill(7) // 72 arrows on day 2
        },
        {
          id: 'day3',
          date: '2025-01-03',
          gameType: 'national', 
          score: 420,
          scores: Array(72).fill(7) // 72 arrows on day 3
        }
      ]
    };

    const result = checkOlympianEffortBronzeAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(216); // 72 × 3 = 216 arrows
    expect(result.targetArrows).toBe(210);
    expect(result.unlockedAt).toBe('2025-01-03');
  });

  test('checkOlympianEffortSilverAchieved - achievement with higher arrow counts', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        {
          id: 'day1',
          date: '2025-01-01',
          gameType: 'national',
          score: 720,
          scores: Array(144).fill(5) // 144 arrows (two rounds in one day)
        },
        {
          id: 'day2',
          date: '2025-01-02',
          gameType: 'national', 
          score: 630,
          scores: Array(126).fill(5) // 126 arrows
        },
        {
          id: 'day3',
          date: '2025-01-03',
          gameType: 'national',
          score: 525,
          scores: Array(105).fill(5) // 105 arrows
        }
      ]
    };

    const result = checkOlympianEffortSilverAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(375); // 144 + 126 + 105 = 375 arrows
    expect(result.targetArrows).toBe(375);
    expect(result.unlockedAt).toBe('2025-01-03');
  });

  test('checkOlympianEffortGoldAchieved - not achieved with non-consecutive days', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        {
          id: 'day1',
          date: '2025-01-01',
          gameType: 'national',
          score: 1200,
          scores: Array(240).fill(5) // 240 arrows on day 1
        },
        {
          id: 'day3', // Gap - day 2 missing
          date: '2025-01-03',
          gameType: 'national',
          score: 1200,
          scores: Array(240).fill(5) // 240 arrows on day 3
        },
        {
          id: 'day4',
          date: '2025-01-04',
          gameType: 'national',
          score: 1200,
          scores: Array(240).fill(5) // 240 arrows on day 4
        }
      ]
    };

    const result = checkOlympianEffortGoldAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(480); // Best consecutive pair: days 3-4 = 240 + 240 = 480 arrows
    expect(result.targetArrows).toBe(600);
  });

  test('checkOlympianEffortDiamondAchieved - achievement with very high arrow counts', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        {
          id: 'day1',
          date: '2025-01-01',
          gameType: 'national',
          score: 1500,
          scores: Array(300).fill(5) // 300 arrows exactly
        },
        {
          id: 'day2',
          date: '2025-01-02',
          gameType: 'national',
          score: 1500,
          scores: Array(300).fill(5) // 300 arrows exactly
        },
        {
          id: 'day3',
          date: '2025-01-03',
          gameType: 'national',
          score: 1500,
          scores: Array(300).fill(5) // 300 arrows exactly
        }
      ]
    };

    const result = checkOlympianEffortDiamondAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(900); // 300 × 3 = 900 arrows
    expect(result.targetArrows).toBe(900);
    expect(result.unlockedAt).toBe('2025-01-03');
  });

  test('handles multiple shoots on the same day correctly', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        // Day 1 - morning shoot
        {
          id: 'day1-morning',
          date: '2025-01-01',
          gameType: 'national',
          score: 360,
          scores: Array(72).fill(5) // 72 arrows
        },
        // Day 1 - afternoon shoot
        {
          id: 'day1-afternoon',
          date: '2025-01-01',
          gameType: 'windsor',
          score: 180,
          scores: Array(36).fill(5) // 36 arrows
        },
        // Day 2 - single shoot
        {
          id: 'day2',
          date: '2025-01-02',
          gameType: 'national',
          score: 540,
          scores: Array(108).fill(5) // 108 arrows
        },
        // Day 3 - single shoot  
        {
          id: 'day3',
          date: '2025-01-03',
          gameType: 'national',
          score: 360,
          scores: Array(72).fill(5) // 72 arrows
        }
      ]
    };

    const result = checkOlympianEffortBronzeAchieved(context);
    
    // Day 1: 72 + 36 = 108, Day 2: 108, Day 3: 72
    // Total: 108 + 108 + 72 = 288 arrows over 3 consecutive days
    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(288);
    expect(result.targetArrows).toBe(210);
  });

  test('finds best 3-day window across longer history', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        // Week 1 - low activity
        {
          id: 'day1',
          date: '2025-01-01',
          gameType: 'bray',
          score: 90,
          scores: Array(30).fill(3) // 30 arrows
        },
        {
          id: 'day2',
          date: '2025-01-02',
          gameType: 'bray',
          score: 90,
          scores: Array(30).fill(3) // 30 arrows
        },
        {
          id: 'day3',
          date: '2025-01-03',
          gameType: 'bray',
          score: 90,
          scores: Array(30).fill(3) // 30 arrows
        },
        // Gap
        // Week 2 - high activity (this should be the best window)
        {
          id: 'day8',
          date: '2025-01-08',
          gameType: 'national',
          score: 720,
          scores: Array(144).fill(5) // 144 arrows
        },
        {
          id: 'day9',
          date: '2025-01-09',
          gameType: 'national',
          score: 630,
          scores: Array(126).fill(5) // 126 arrows
        },
        {
          id: 'day10',
          date: '2025-01-10',
          gameType: 'national',
          score: 525,
          scores: Array(105).fill(5) // 105 arrows
        }
      ]
    };

    const result = checkOlympianEffortSilverAchieved(context);
    
    // Should find the best window: days 8-10 = 144 + 126 + 105 = 375 arrows
    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(375);
    expect(result.targetArrows).toBe(375);
    expect(result.unlockedAt).toBe('2025-01-10');
  });

  test('handles current shoot contribution to 3-day total', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    
    const context: AchievementContext = {
      currentShoot: {
        scores: Array(72).fill(8) // 72 arrows in current shoot
      },
      shootHistory: [
        // Yesterday
        {
          id: 'yesterday',
          date: yesterday.toISOString().split('T')[0],
          gameType: 'national',
          score: 720,
          scores: Array(144).fill(5) // 144 arrows
        },
        // Day before yesterday
        {
          id: 'day-before',
          date: dayBefore.toISOString().split('T')[0],
          gameType: 'national',
          score: 630,
          scores: Array(126).fill(5) // 126 arrows
        }
      ]
    };

    const result = checkOlympianEffortSilverAchieved(context);
    
    // Should include current shoot: 126 + 144 + 72 = 342 arrows
    // This is close to but below the silver threshold of 375
    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(342);
    expect(result.targetArrows).toBe(375);
  });

  test('handles empty history and current shoot', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: []
    };

    const result = checkOlympianEffortBronzeAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(0);
    expect(result.targetArrows).toBe(210);
    expect(result.unlockedAt).toBeUndefined();
  });

  test('handles single day with enough arrows (qualifying)', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: []
      },
      shootHistory: [
        {
          id: 'single-day',
          date: '2025-01-01',
          gameType: 'marathon',
          score: 5000,
          scores: Array(1000).fill(5) // 1000 arrows in one day
        }
      ]
    };

    const result = checkOlympianEffortDiamondAchieved(context);
    
    // Single day DOES qualify - "within any 3-day period" includes single days
    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(1000); // Shows the single day total
    expect(result.targetArrows).toBe(900);
  });
});
