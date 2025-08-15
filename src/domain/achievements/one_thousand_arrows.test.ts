/**
 * 1k Arrows Achievement Tests
 * 
 * Tests for the 1,000 arrows achievement logic
 */

import { describe, test, expect } from 'vitest';
import { check1kArrowsAchieved } from './one_thousand_arrows.js';
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

describe('1k Arrows Achievement', () => {
  test('counts total arrows correctly', () => {
    const context = createTestContext();
    
    const progress = check1kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(18); // 6 + 6 + 6 arrows
    expect(progress.targetArrows).toBe(1000);
    expect(progress.isUnlocked).toBe(false);
  });

  test('unlocks achievement when 1k arrows reached', () => {
    const context = createTestContext();
    // Create enough history to reach 1k arrows
    context.shootHistory = [];
    for (let i = 0; i < 165; i++) { // 165 * 6 = 990 arrows
      context.shootHistory.push({
        scores: [9, 8, 7, 9, 8, 7] // 6 arrows each
      });
    }
    context.currentShoot.scores = Array(16).fill(9); // 16 more = 1006 total
    
    const progress = check1kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(1006);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('sets unlockedAt timestamp when achievement unlocked', () => {
    const context = createTestContext();
    // Set up exactly 1k arrows
    context.currentShoot.scores = Array(1000).fill(9);
    context.shootHistory = [];
    
    const progress = check1kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(1000);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date format
  });
});