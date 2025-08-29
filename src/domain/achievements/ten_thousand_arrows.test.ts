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
    shootHistory: [
      {
        scores: [9, 8, 7, 9, 8, 7] // 6 arrows
      },
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
    for (let i = 0; i < 1667; i++) { // 1666 * 6 = 9996 arrows
      context.shootHistory.push({
        scores: [9, 8, 7, 9, 8, 7] // 6 arrows each
      });
    }

    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(10002);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('handles empty scores arrays', () => {
    const context: AchievementContext = {
      shootHistory: [
        { scores: [] },
        { scores: [9, 8, 7] }
      ]
    };
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(3); // Only the one with 3 arrows
    expect(progress.isUnlocked).toBe(false);
  });


  test('sets unlockedAt timestamp when achievement unlocked', () => {
    const context: AchievementContext = {
      shootHistory: [
        { scores: Array(10000).fill(9) }
      ]
    };
    
    const progress = check10kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(10000);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date format
  });
});