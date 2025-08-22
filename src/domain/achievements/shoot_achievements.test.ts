/**
 * Tests for shoot achievements service
 */

import { describe, test, expect, vi } from 'vitest';
import { getAchievementsForShoot } from './shoot_achievements.js';

// Mock the calculator
vi.mock('./calculator.js', () => ({
  calculateAchievements: vi.fn()
}));

const { calculateAchievements } = await import('./calculator.js');
const mockCalculateAchievements = vi.mocked(calculateAchievements);

describe('getAchievementsForShoot', () => {
  const mockContext: any = {
    currentShoot: {
      id: 123,
      date: '2023-01-01',
      scores: [10, 9, 8],
      score: 27,
      gameType: 'test',
      userProfile: {}
    },
    shootHistory: []
  };

  test('returns only achievements earned by specific shoot', () => {
    const mockAchievements = [
      {
        id: 'achievement1',
        name: 'Achievement 1',
        description: 'First achievement',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          achievedDate: '2023-01-01T10:00:00Z'
        }
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
        }
      },
      {
        id: 'achievement3',
        name: 'Achievement 3',
        description: 'Third achievement',
        tier: 'gold',
        progress: {
          isUnlocked: false, // Not unlocked
          achievingShootId: 123
        }
      }
    ];

    mockCalculateAchievements.mockReturnValue(mockAchievements);

    const result = getAchievementsForShoot(mockContext, 123);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('achievement1');
    expect(result[0].progress.achievingShootId).toBe(123);
  });

  test('sorts achievements by achieved date (newest first)', () => {
    const mockAchievements = [
      {
        id: 'older',
        name: 'Older Achievement',
        description: 'Older',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          achievedDate: '2023-01-01T10:00:00Z'
        }
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
        }
      }
    ];

    mockCalculateAchievements.mockReturnValue(mockAchievements);

    const result = getAchievementsForShoot(mockContext, 123);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('newer'); // Should be first (newest)
    expect(result[1].id).toBe('older'); // Should be second (oldest)
  });

  test('returns empty array when no achievements match', () => {
    const mockAchievements = [
      {
        id: 'achievement1',
        name: 'Achievement 1',
        description: 'First achievement',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 456, // Different shoot
          achievedDate: '2023-01-01T10:00:00Z'
        }
      }
    ];

    mockCalculateAchievements.mockReturnValue(mockAchievements);

    const result = getAchievementsForShoot(mockContext, 123);

    expect(result).toHaveLength(0);
  });

  test('handles achievements with unlockedAt instead of achievedDate', () => {
    const mockAchievements = [
      {
        id: 'achievement1',
        name: 'Achievement 1',
        description: 'First achievement',
        tier: 'bronze',
        progress: {
          isUnlocked: true,
          achievingShootId: 123,
          unlockedAt: '2023-01-01T10:00:00Z' // Using unlockedAt instead
        }
      }
    ];

    mockCalculateAchievements.mockReturnValue(mockAchievements);

    const result = getAchievementsForShoot(mockContext, 123);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('achievement1');
  });
});