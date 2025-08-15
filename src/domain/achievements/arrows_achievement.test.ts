/**
 * Arrows Achievement HOF Tests
 * 
 * Tests for the higher-order function that powers arrow count achievements
 */

import { describe, test, expect } from 'vitest';
import { checkArrowsAchievement } from './arrows_achievement.js';
import type { AchievementContext } from './types.js';

function createTestContext(): AchievementContext {
  return {
    currentShoot: {
      scores: [9, 8, 7, 9, 8, 7] // 6 arrows
    },
    shootHistory: [
      {
        scores: [8, 7, 6, 8, 7, 6] // 6 arrows
      },
      {
        scores: [7, 6, 5, 7, 6, 5] // 6 arrows
      }
    ]
  };
}

describe('Arrows Achievement HOF', () => {
  test('works with any target number', () => {
    const context = createTestContext();
    
    const progress1000 = checkArrowsAchievement(context, 1000);
    const progress100 = checkArrowsAchievement(context, 100);
    const progress10 = checkArrowsAchievement(context, 10);
    
    expect(progress1000.totalArrows).toBe(18);
    expect(progress1000.targetArrows).toBe(1000);
    expect(progress1000.isUnlocked).toBe(false);
    
    expect(progress100.totalArrows).toBe(18);
    expect(progress100.targetArrows).toBe(100);
    expect(progress100.isUnlocked).toBe(false);
    
    expect(progress10.totalArrows).toBe(18);
    expect(progress10.targetArrows).toBe(10);
    expect(progress10.isUnlocked).toBe(true);
  });

  test('calculates correct percentage for different targets', () => {
    const context = createTestContext(); // 18 arrows total
    
    const progress100 = checkArrowsAchievement(context, 100);
    const progress200 = checkArrowsAchievement(context, 200);
    
    // 18/100 = 18%, 18/200 = 9%
    expect(progress100.totalArrows / progress100.targetArrows).toBeCloseTo(0.18);
    expect(progress200.totalArrows / progress200.targetArrows).toBeCloseTo(0.09);
  });

  test('handles edge cases', () => {
    const emptyContext: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: []
    };
    
    const progress = checkArrowsAchievement(emptyContext, 100);
    
    expect(progress.totalArrows).toBe(0);
    expect(progress.targetArrows).toBe(100);
    expect(progress.isUnlocked).toBe(false);
    expect(progress.unlockedAt).toBeUndefined();
  });
});