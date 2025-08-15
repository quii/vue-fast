/**
 * Achievement Calculator Tests
 * 
 * Tests for the domain function that calculates achievement data
 */

import { describe, test, expect } from 'vitest';
import { calculateAchievements } from './calculator.js';
import type { AchievementContext } from './types.js';
import type { HistoryItem } from '../repositories/player_history.js';

function createTestContext(): AchievementContext {
  const historyItems: HistoryItem[] = [
    {
      id: 1,
      date: '2023-01-01',
      gameType: 'national',
      score: 100,
      scores: [8, 7, 6, 8, 7, 6], // 6 arrows
      unit: 'yd',
      topScore: false
    },
    {
      id: 2,
      date: '2023-01-02',
      gameType: 'wa 70m',
      score: 620,
      scores: [7, 6, 5, 7, 6, 5], // 6 arrows
      unit: 'm',
      topScore: false
    }
  ];

  return {
    currentShoot: {
      scores: [9, 8, 7, 9, 8, 7] // 6 arrows
    },
    shootHistory: historyItems
  };
}

describe('Achievement Calculator', () => {
  test('calculates all achievements correctly', () => {
    const context = createTestContext();
    
    const achievements = calculateAchievements(context);
    
    // Should return all achievements from registry
    expect(achievements.length).toBeGreaterThan(0);
    
    // Each achievement should have all required properties
    achievements.forEach(achievement => {
      expect(achievement).toHaveProperty('id');
      expect(achievement).toHaveProperty('name');
      expect(achievement).toHaveProperty('description');
      expect(achievement).toHaveProperty('tier');
      expect(achievement).toHaveProperty('progress');
      expect(achievement).toHaveProperty('progressPercentage');
      expect(typeof achievement.progressPercentage).toBe('number');
    });
  });

  test('calculates arrow achievements correctly', () => {
    const context = createTestContext();
    
    const achievements = calculateAchievements(context);
    const arrowAchievements = achievements.filter(a => 
      ['one_thousand_arrows', 'ten_thousand_arrows', 'twenty_five_thousand_arrows', 'agincourt_arrows'].includes(a.id)
    );
    
    arrowAchievements.forEach(achievement => {
      expect(achievement.progress.totalArrows).toBe(18); // 6 + 6 + 6 arrows
      expect(achievement.progress.isUnlocked).toBe(false); // 18 < any target
      expect(achievement.progressPercentage).toBeGreaterThan(0);
      expect(achievement.progressPercentage).toBeLessThan(100);
    });
  });

  test('calculates score achievements correctly', () => {
    const context = createTestContext();
    
    const achievements = calculateAchievements(context);
    const scoreAchievement = achievements.find(a => a.id === 'six_hundred_at_wa70');
    
    expect(scoreAchievement).toBeDefined();
    expect(scoreAchievement!.progress.currentScore).toBe(620); // Best WA 70m score
    expect(scoreAchievement!.progress.targetScore).toBe(600);
    expect(scoreAchievement!.progress.isUnlocked).toBe(true); // 620 >= 600
    expect(scoreAchievement!.progressPercentage).toBe(100);
  });
});
