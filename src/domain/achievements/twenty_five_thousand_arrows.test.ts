/**
 * 25k Arrows Achievement Tests
 * 
 * Tests for the 25,000 arrows achievement logic
 */

import { describe, test, expect } from 'vitest';
import { check25kArrowsAchieved } from './twenty_five_thousand_arrows.js';
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

describe('25k Arrows Achievement', () => {
  test('counts total arrows correctly', () => {
    const context = createTestContext();
    
    const progress = check25kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(18); // 6 + 6 + 6 arrows
    expect(progress.targetArrows).toBe(25000);
    expect(progress.isUnlocked).toBe(false);
  });

  test('unlocks achievement when 25k arrows reached', () => {
    const context = createTestContext();
    // Create enough history to reach 25k arrows
    context.shootHistory = [];
    for (let i = 0; i < 4166; i++) { // 4166 * 6 = 24996 arrows
      context.shootHistory.push({
        scores: [9, 8, 7, 9, 8, 7] // 6 arrows each
      });
    }
    // Current shoot adds 6 more = 25002 total
    
    const progress = check25kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(25002);
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
    
    const progress = check25kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(3); // Only the one with 3 arrows
    expect(progress.isUnlocked).toBe(false);
  });

  test('sets unlockedAt timestamp when achievement unlocked', () => {
    const context = createTestContext();
    // Set up exactly 25k arrows
    context.currentShoot.scores = Array(25000).fill(9);
    context.shootHistory = [];
    
    const progress = check25kArrowsAchieved(context);
    
    expect(progress.totalArrows).toBe(25000);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date format
  });
});