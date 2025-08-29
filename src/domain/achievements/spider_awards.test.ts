/**
 * Spider Awards Achievement Tests
 * 
 * Tests for the spider (X score) achievement logic
 */

import { describe, expect, test } from 'vitest'
import {
  checkSpiderAt30mAchieved,
  checkSpiderAt40mAchieved,
  checkSpiderAt50mAchieved,
  checkSpiderAt70mAchieved,
  checkSpiderAt90mAchieved
} from './spider_awards.js'
import type { AchievementContext } from './types.js'

describe('Spider Awards - 70m Achievement', () => {
  test('detects X in history', () => {
    const context = {
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
    }

    const progress = checkSpiderAt70mAchieved(context)

    expect(progress.isUnlocked).toBe(true)
    expect(progress.achievingShootId).toBe(2)
    expect(progress.achievedDate).toBe('2023-01-10')
  })

  test('no achievement when no X scores', () => {
    const context = {
      shootHistory: [
        {
          id: 1,
          date: '2023-01-01',
          scores: [10, 9, 8, 7, 6, 5], // No X
          score: 45,
          gameType: 'practice 70m'
        },
      ]
    }

    const progress = checkSpiderAt70mAchieved(context)

    expect(progress.isUnlocked).toBe(false)
  })

  test('ignores imperial rounds', () => {
    const context = {
      shootHistory: [
        {
          id: 1,
          date: '2023-01-01',
          scores: [9, 7, 7, 5, 5],
          score: 45,
          gameType: 'national'
        },
      ]
    }

    const progress = checkSpiderAt70mAchieved(context)

    expect(progress.isUnlocked).toBe(false)
  })

  test('only counts scores at the correct distance', () => {
    const context: AchievementContext = {
      shootHistory: [{
        gameType: 'wa 1440 (90m)',
        scores: [
          // First 36 arrows at 90m (arrows 0-35)
          'X',
          10,
          9,
          8,
          7,
          6,
          'X',
          10,
          9,
          8,
          7,
          6,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          // Next 36 arrows at 70m (arrows 36-71)
          'X',
          'X',
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7,
          6,
          5,
          10,
          9,
          8,
          7
        ]
      }]
    }

    // Check 90m achievement - should only count X's from first 36 arrows
    const progress90 = checkSpiderAt90mAchieved(context)
    expect(progress90.isUnlocked).toBe(true)

    // Check 70m achievement - should only count X's from arrows 36-71
    const progress70 = checkSpiderAt70mAchieved(context)
    expect(progress70.isUnlocked).toBe(true)
  })
})

describe('Spider Awards - Different Distances', () => {
  test('30m achievement (Bronze tier)', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 30m' // 30m outdoor metric
      }]
    };
    
    const progress = checkSpiderAt30mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('40m achievement (Silver tier)', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 40m' // 40m outdoor metric
      }]
    };
    
    const progress = checkSpiderAt40mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('50m achievement (Silver tier)', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 50m' // 50m outdoor metric
      }]
    };
    
    const progress = checkSpiderAt50mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('90m achievement (Diamond tier)', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        scores: ['X', 10, 9, 8, 7, 6],
        gameType: 'practice 90m' // 90m outdoor metric
      }]
    };
    
    const progress = checkSpiderAt90mAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });
});

describe('Spider Awards - Edge Cases', () => {
  test('handles empty scores arrays', () => {
    const context: AchievementContext = {
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

});