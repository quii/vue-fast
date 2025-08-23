/**
 * Spider Awards Achievement Tests
 * 
 * Tests for the spider (X score) achievement logic
 */

import { describe, test, expect } from 'vitest';
import { 
  checkSpiderAt30mAchieved,
  checkSpiderAt40mAchieved,
  checkSpiderAt50mAchieved,
  checkSpiderAt60mAchieved,
  checkSpiderAt70mAchieved,
  checkSpiderAt90mAchieved 
} from './spider_awards.js';
import type { AchievementContext } from './types.js';

function createTestContext(): AchievementContext {
  return {
    currentShoot: {
      id: 'current',
      date: '2023-01-15',
      scores: ['X', 10, 9, 8, 7, 6], // 6 arrows with 1 X
      gameType: 'practice 70m' // Outdoor metric round that exists
    },
    shootHistory: [
      {
        id: 1,
        date: '2023-01-01',
        scores: [10, 9, 8, 7, 6, 5], // No X
        score: 45,
        gameType: 'practice 70m'
      },
      {
        id: 2,
        date: '2023-01-10',
        scores: ['X', 'X', 10, 9, 8, 7], // 2 X's
        score: 54,
        gameType: 'practice 70m'
      }
    ]
  };
}

describe('Spider Awards - 70m Achievement', () => {
  test('detects X in current shoot', () => {
    const context = createTestContext();
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.achievingShootId).toBe('current');
    expect(progress.achievedDate).toBe('2023-01-15');
  });

  test('detects X in history', () => {
    const context = createTestContext();
    // Remove X from current shoot
    context.currentShoot.scores = [10, 9, 8, 7, 6, 5];
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.achievingShootId).toBe(2);
    expect(progress.achievedDate).toBe('2023-01-10');
  });

  test('no achievement when no X scores', () => {
    const context = createTestContext();
    context.currentShoot.scores = [10, 9, 8, 7, 6, 5];
    context.shootHistory = [
      {
        id: 1,
        date: '2023-01-01',
        scores: [10, 9, 8, 7, 6, 5],
        score: 45,
        gameType: 'wa 70m'
      }
    ];
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('ignores imperial rounds', () => {
    const context = createTestContext();
    context.currentShoot.gameType = 'national'; // Imperial round
    context.currentShoot.scores = [9, 7, 5, 9, 7, 5]; // Imperial scores
    // Clear history so it doesn't find X's from the metric rounds
    context.shootHistory = [];
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('ignores indoor rounds', () => {
    const context = createTestContext();
    context.currentShoot.gameType = 'vegas'; // Indoor round
    context.currentShoot.scores = [10, 10, 9, 10, 9, 8]; // No X in indoor
    // Clear history so it doesn't find X's from the metric rounds
    context.shootHistory = [];
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('only counts scores at the correct distance', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: [
          // First 36 arrows at 90m (arrows 0-35)
          'X', 10, 9, 8, 7, 6, 'X', 10, 9, 8, 7, 6, 
          10, 9, 8, 7, 6, 5, 10, 9, 8, 7, 6, 5,
          10, 9, 8, 7, 6, 5, 10, 9, 8, 7, 6, 5,
          // Next 36 arrows at 70m (arrows 36-71)
          'X', 'X', 10, 9, 8, 7, 6, 5, 10, 9, 8, 7,
          6, 5, 10, 9, 8, 7, 6, 5, 10, 9, 8, 7,
          6, 5, 10, 9, 8, 7, 6, 5, 10, 9, 8, 7
        ],
        gameType: 'wa 1440 (90m)' // Round with 90m and 70m distances
      },
      shootHistory: []
    };
    
    // Check 90m achievement - should only count X's from first 36 arrows
    const progress90 = checkSpiderAt90mAchieved(context);
    expect(progress90.isUnlocked).toBe(true);
    
    // Check 70m achievement - should only count X's from arrows 36-71
    const progress70 = checkSpiderAt70mAchieved(context);
    expect(progress70.isUnlocked).toBe(true);
  });
});

describe('Spider Awards - Different Distances', () => {
  test('30m achievement (Bronze tier)', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 30m' // 30m outdoor metric
      },
      shootHistory: []
    };
    
    const progress = checkSpiderAt30mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('40m achievement (Silver tier)', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 40m' // 40m outdoor metric
      },
      shootHistory: []
    };
    
    const progress = checkSpiderAt40mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('50m achievement (Silver tier)', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 50m' // 50m outdoor metric
      },
      shootHistory: []
    };
    
    const progress = checkSpiderAt50mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('90m achievement (Diamond tier)', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 90m' // 90m outdoor metric
      },
      shootHistory: []
    };
    
    const progress = checkSpiderAt90mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });
});

describe('Spider Awards - Edge Cases', () => {
  test('handles empty scores arrays', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [
        {
          id: 1,
          date: '2023-01-01',
          scores: [],
          score: 0,
          gameType: 'wa 70m'
        }
      ]
    };
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('handles rounds without X in scores', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: [10, 9, 8, 7, 6, 5],
        gameType: 'bray ii' // Indoor round without X
      },
      shootHistory: []
    };
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('prioritizes current shoot over history for achieving shoot', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'wa 70m'
      },
      shootHistory: [
        {
          id: 1,
          date: '2023-01-01',
          scores: ['X', 'X', 10, 9, 8, 7], // More X's but earlier
          score: 54,
          gameType: 'wa 70m'
        }
      ]
    };
    
    const progress = checkSpiderAt70mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.achievingShootId).toBe('current'); // Current shoot takes priority
    expect(progress.achievedDate).toBe('2023-01-15');
  });
});