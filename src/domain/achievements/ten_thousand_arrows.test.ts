/**
 * 10k Arrows Achievement Tests
 * 
 * Tests for the 10,000 arrows achievement logic
 */

import { describe, test, expect } from 'vitest';
import { check10kArrowsAchieved } from './ten_thousand_arrows.js';
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

describe('10k Arrows Achievement', () => {
  test('counts total arrows correctly', () => {
    const context = createTestContext();
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(18); // 6 + 6 + 6 arrows
    expect(progress.targetArrows).toBe(10000);
    expect(progress.isUnlocked).toBe(false);
  });

  test('unlocks achievement when 10k arrows reached', () => {
    const context = createTestContext();
    // Create enough history to reach 10k arrows
    context.shootHistory = [];
    for (let i = 0; i < 1666; i++) { // 1666 * 6 = 9996 arrows
      context.shootHistory.push({
        scores: [9, 8, 7, 9, 8, 7] // 6 arrows each
      });
    }
    // Current shoot adds 6 more = 10002 total
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(10002);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('handles empty scores arrays', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { scores: [] },
        { scores: [9, 8, 7] }
      ]
    };
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(3); // Only the one with 3 arrows
    expect(progress.isUnlocked).toBe(false);
  });

  test('handles non-array scores', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [9, 8] },
      shootHistory: [
        { scores: null as any },
        { scores: undefined as any },
        { scores: [7, 6, 5] }
      ]
    };
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(5); // 2 + 0 + 0 + 3
    expect(progress.isUnlocked).toBe(false);
  });

  test('sets unlockedAt timestamp when achievement unlocked', () => {
    const context = createTestContext();
    // Set up exactly 10k arrows
    context.currentShoot.scores = Array(10000).fill(9);
    context.shootHistory = [];
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(10000);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date format
  });
});