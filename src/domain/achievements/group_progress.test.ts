/**
import { describe, test, expect } from 'vitest';
import { calculateGroupProgress } from './group_progress.js';
import type { AchievementData } from './calculator.js';Tests for Group Progress Calculations
 */

import { describe, test, expect } from 'vitest';
import { calculateGroupProgress } from './group_progress.js';
import type { AchievementData } from './types.js';

describe('Group Progress Calculations', () => {
  test('calculates progress for mixed achievements with different tiers', () => {
    const achievements: AchievementData[] = [
      {
        id: 'bronze1',
        name: 'Bronze 1',
        description: 'Bronze achievement',
        tier: 'bronze',
        progress: { isUnlocked: true },
        progressPercentage: 100
      },
      {
        id: 'bronze2', 
        name: 'Bronze 2',
        description: 'Bronze achievement',
        tier: 'bronze',
        progress: { isUnlocked: false },
        progressPercentage: 50
      },
      {
        id: 'silver1',
        name: 'Silver 1', 
        description: 'Silver achievement',
        tier: 'silver',
        progress: { isUnlocked: true },
        progressPercentage: 100
      },
      {
        id: 'gold1',
        name: 'Gold 1',
        description: 'Gold achievement', 
        tier: 'gold',
        progress: { isUnlocked: false },
        progressPercentage: 75
      },
      {
        id: 'diamond1',
        name: 'Diamond 1',
        description: 'Diamond achievement',
        tier: 'diamond', 
        progress: { isUnlocked: true },
        progressPercentage: 100
      }
    ];

    const result = calculateGroupProgress(achievements);

    expect(result.totalEarned).toBe(3);
    expect(result.totalAchievements).toBe(5);
    expect(result.tierProgress).toHaveLength(4); // All 4 tiers represented

    // Check bronze progress
    const bronzeProgress = result.tierProgress.find(t => t.tier === 'bronze');
    expect(bronzeProgress).toBeDefined();
    expect(bronzeProgress?.earned).toBe(1);
    expect(bronzeProgress?.total).toBe(2);

    // Check silver progress  
    const silverProgress = result.tierProgress.find(t => t.tier === 'silver');
    expect(silverProgress).toBeDefined();
    expect(silverProgress?.earned).toBe(1);
    expect(silverProgress?.total).toBe(1);

    // Check gold progress
    const goldProgress = result.tierProgress.find(t => t.tier === 'gold');
    expect(goldProgress).toBeDefined();
    expect(goldProgress?.earned).toBe(0);
    expect(goldProgress?.total).toBe(1);

    // Check diamond progress
    const diamondProgress = result.tierProgress.find(t => t.tier === 'diamond');
    expect(diamondProgress).toBeDefined();
    expect(diamondProgress?.earned).toBe(1);
    expect(diamondProgress?.total).toBe(1);
  });

  test('filters out tiers with no achievements', () => {
    const achievements: AchievementData[] = [
      {
        id: 'bronze1',
        name: 'Bronze 1',
        description: 'Bronze achievement',
        tier: 'bronze',
        progress: { isUnlocked: true },
        progressPercentage: 100
      },
      {
        id: 'gold1',
        name: 'Gold 1', 
        description: 'Gold achievement',
        tier: 'gold',
        progress: { isUnlocked: false },
        progressPercentage: 50
      }
    ];

    const result = calculateGroupProgress(achievements);

    expect(result.tierProgress).toHaveLength(2); // Only bronze and gold
    expect(result.tierProgress.some(t => t.tier === 'bronze')).toBe(true);
    expect(result.tierProgress.some(t => t.tier === 'gold')).toBe(true);
    expect(result.tierProgress.some(t => t.tier === 'silver')).toBe(false);
    expect(result.tierProgress.some(t => t.tier === 'diamond')).toBe(false);
  });

  test('handles empty achievement list', () => {
    const achievements: AchievementData[] = [];
    const result = calculateGroupProgress(achievements);

    expect(result.totalEarned).toBe(0);
    expect(result.totalAchievements).toBe(0);
    expect(result.tierProgress).toHaveLength(0);
  });

  test('handles all achievements earned', () => {
    const achievements: AchievementData[] = [
      {
        id: 'bronze1',
        name: 'Bronze 1',
        description: 'Bronze achievement',
        tier: 'bronze',
        progress: { isUnlocked: true },
        progressPercentage: 100
      },
      {
        id: 'silver1',
        name: 'Silver 1',
        description: 'Silver achievement', 
        tier: 'silver',
        progress: { isUnlocked: true },
        progressPercentage: 100
      }
    ];

    const result = calculateGroupProgress(achievements);

    expect(result.totalEarned).toBe(2);
    expect(result.totalAchievements).toBe(2);
    
    const bronzeProgress = result.tierProgress.find(t => t.tier === 'bronze');
    expect(bronzeProgress?.earned).toBe(1);
    expect(bronzeProgress?.total).toBe(1);

    const silverProgress = result.tierProgress.find(t => t.tier === 'silver');
    expect(silverProgress?.earned).toBe(1);
    expect(silverProgress?.total).toBe(1);
  });
});
