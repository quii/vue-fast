/**
 * 600 at WA70 Achievement Tests
 * 
 * Tests for the 600+ score on WA 70m achievement logic
 */

import { describe, test, expect } from 'vitest';
import { check600AtWA70Achieved } from './six_hundred_at_wa70.js';
import type { AchievementContext } from './types.js';

function createTestContext(): AchievementContext {
  return {
    currentShoot: {
      scores: [9, 8, 7, 9, 8, 7],
      score: 480,
      gameType: 'wa 70m'
    },
    shootHistory: [
      {
        scores: [8, 7, 6, 8, 7, 6],
        score: 420,
        gameType: 'wa 70m'
      },
      {
        scores: [7, 6, 5, 7, 6, 5],
        score: 360,
        gameType: 'national'
      }
    ]
  };
}

describe('600 at WA70 Achievement', () => {
  test('does not unlock when score is below 600', () => {
    const context = createTestContext();
    context.currentShoot.score = 580;
    
    const progress = check600AtWA70Achieved(context);
    
    expect(progress.currentScore).toBe(580);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(false);
    expect(progress.unlockedAt).toBeUndefined();
  });

  test('unlocks when current shoot scores 600+ on WA 70m', () => {
    const context = createTestContext();
    context.currentShoot.score = 620;
    context.currentShoot.gameType = 'wa 70m';
    
    const progress = check600AtWA70Achieved(context);
    
    expect(progress.currentScore).toBe(620);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('unlocks when historical shoot has 600+ on WA 70m', () => {
    const context = createTestContext();
    context.currentShoot.score = 500;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        scores: [10, 10, 10, 10, 10, 10],
        score: 650,
        gameType: 'wa 70m'
      },
      {
        scores: [8, 7, 6, 8, 7, 6],
        score: 420,
        gameType: 'wa 70m'
      }
    ];
    
    const progress = check600AtWA70Achieved(context);
    
    expect(progress.currentScore).toBe(650);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(true);
  });

  test('does not unlock for high scores on different rounds', () => {
    const context = createTestContext();
    context.currentShoot.score = 650;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        scores: [9, 9, 9, 9, 9, 9],
        score: 750,
        gameType: 'national'
      }
    ];
    
    const progress = check600AtWA70Achieved(context);
    
    expect(progress.currentScore).toBe(0); // No WA 70m shoots
    expect(progress.isUnlocked).toBe(false);
  });

  test('finds best WA 70m score across all shoots', () => {
    const context = createTestContext();
    context.currentShoot.score = 580;
    context.currentShoot.gameType = 'wa 70m';
    context.shootHistory = [
      {
        scores: [],
        score: 590,
        gameType: 'wa 70m'
      },
      {
        scores: [],
        score: 570,
        gameType: 'wa 70m'
      },
      {
        scores: [],
        score: 720,
        gameType: 'national' // Different round, shouldn't count
      }
    ];
    
    const progress = check600AtWA70Achieved(context);
    
    expect(progress.currentScore).toBe(590); // Best WA 70m score
    expect(progress.isUnlocked).toBe(false);
  });

  test('handles case insensitive game type matching', () => {
    const context = createTestContext();
    context.currentShoot.score = 610;
    context.currentShoot.gameType = 'WA 70M'; // Different case
    
    const progress = check600AtWA70Achieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });
});