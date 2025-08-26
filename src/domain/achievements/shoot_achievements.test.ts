/**
 * Tests for shoot achievements service
 */

import { describe, test, expect } from 'vitest';
import { getAchievementsForShoot } from './shoot_achievements.js';
import type { AchievementData } from './calculator.js';

describe('getAchievementsForShoot', () => {
  test('returns only achievements earned by specific shoot', () => {
    const mockAchievements: AchievementData[] = [
      {
        id: 'achievement1',
        name: 'Achievement 1',
        description: 'First achievement',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          achievedDate: '2023-01-01T10:00:00Z'
        },
        progressPercentage: 100
      },
      {
        id: 'achievement2',
        name: 'Achievement 2',
        description: 'Second achievement',
        tier: 'silver',
        progress: {
          isUnlocked: true,
          achievingShootId: 456, // Different shoot
          achievedDate: '2023-01-02T10:00:00Z'
        },
        progressPercentage: 100
      },
      {
        id: 'achievement3',
        name: 'Achievement 3',
        description: 'Third achievement',
        tier: 'gold',
        progress: {
          isUnlocked: false, // Not unlocked
          achievingShootId: 123
        },
        progressPercentage: 0
      }
    ];

    const result = getAchievementsForShoot(mockAchievements, 123);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('achievement1');
    expect(result[0].progress.achievingShootId).toBe(123);
  });

  test('sorts achievements by achieved date (newest first)', () => {
    const mockAchievements: AchievementData[] = [
      {
        id: 'older',
        name: 'Older Achievement',
        description: 'Older',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          achievedDate: '2023-01-01T10:00:00Z'
        },
        progressPercentage: 100
      },
      {
        id: 'newer',
        name: 'Newer Achievement',
        description: 'Newer',
        tier: 'silver',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          achievedDate: '2023-01-02T10:00:00Z'
        },
        progressPercentage: 100
      }
    ];

    const result = getAchievementsForShoot(mockAchievements, 123);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('newer');
    expect(result[1].id).toBe('older');
  });

  test('returns empty array when no achievements match', () => {
    const mockAchievements: AchievementData[] = [
      {
        id: 'achievement1',
        name: 'Achievement 1',
        description: 'First achievement',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 456, // Different shoot
          achievedDate: '2023-01-01T10:00:00Z'
        },
        progressPercentage: 100
      }
    ];

    const result = getAchievementsForShoot(mockAchievements, 123);

    expect(result).toHaveLength(0);
  });

  test('handles achievements with unlockedAt instead of achievedDate', () => {
    const mockAchievements: AchievementData[] = [
      {
        id: 'achievement1',
        name: 'Achievement 1',
        description: 'First achievement',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          unlockedAt: '2023-01-01T10:00:00Z' // Only unlockedAt, no achievedDate
        },
        progressPercentage: 100
      }
    ];

    const result = getAchievementsForShoot(mockAchievements, 123);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('achievement1');
  });
});