/**
 * Red Alert Achievement Tests
 * 
 * Tests for the Red Alert achievement system:
 * - Imperial: all 7s in an end
 * - Metric: all 7s or 8s (or mixed) in an end
 */

import { describe, test, expect } from 'vitest';
import { 
  checkRedAlertAt50ydAchieved,
  checkRedAlertAt70mAchieved,
  RED_ALERT_ACHIEVEMENTS 
} from './red_alert.js';
import type { AchievementContext } from './types.js';

describe('Red Alert Achievement System', () => {
  test('generates achievements for all imperial and metric distances', () => {
    // 8 imperial + 10 metric = 18 total achievements
    expect(RED_ALERT_ACHIEVEMENTS).toHaveLength(18);
    
    // Check some specific achievements exist with correct properties
    const imperial50yd = RED_ALERT_ACHIEVEMENTS.find(a => a.id === 'red_alert_at_50yd');
    expect(imperial50yd).toBeDefined();
    expect(imperial50yd?.name).toBe('Red Alert at 50yd');
    expect(imperial50yd?.tier).toBe('silver');
    expect(imperial50yd?.description).toContain('all 7s');
    expect(imperial50yd?.description).toContain('50yd');
    
    const metric70m = RED_ALERT_ACHIEVEMENTS.find(a => a.id === 'red_alert_at_70m');
    expect(metric70m).toBeDefined();
    expect(metric70m?.name).toBe('Red Alert at 70m');
    expect(metric70m?.tier).toBe('silver');
    expect(metric70m?.description).toContain('all 7s or 8s');
    expect(metric70m?.description).toContain('70m');
  });

  test('checkRedAlertAt50ydAchieved - achievement with end of all 7s in imperial round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'windsor 50'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'windsor 50',
        scores: [
          // First end at 50yd - Red Alert end (all 7s)
          7, 7, 7, 7, 7, 7,
          // Second end at 50yd - normal scores
          9, 8, 7, 6, 5, 4,
          // Remaining arrows at other distances
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 195,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkRedAlertAt50ydAchieved - no achievement with end of mixed scores in imperial round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'windsor 50'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'windsor 50',
        scores: [
          // First end at 50yd - mixed scores (not all 7s)
          7, 7, 8, 7, 7, 7,
          // Rest of the round
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 195,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkRedAlertAt70mAchieved - achievement with end of all 7s in metric round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        scores: [
          // First end at 70m - Red Alert end (all 7s)
          7, 7, 7, 7, 7, 7,
          // Rest of the round - normal scores
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 195,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkRedAlertAt70mAchieved - achievement with end of all 8s in metric round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        scores: [
          // First end at 70m - Red Alert end (all 8s)
          8, 8, 8, 8, 8, 8,
          // Rest of the round - normal scores
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 207,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkRedAlertAt70mAchieved - achievement with mixed 7s and 8s in metric round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        scores: [
          // First end at 70m - Red Alert end (mixed 7s and 8s)
          7, 8, 7, 8, 7, 8,
          // Rest of the round - normal scores
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 201,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkRedAlertAt70mAchieved - no achievement with scores other than 7s/8s in metric round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        scores: [
          // First end at 70m - mixed scores including 9 (not Red Alert)
          7, 8, 7, 9, 7, 8,
          // Rest of the round - normal scores
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 204,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkRedAlertAt50ydAchieved - no achievement when distance not in round', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'wa 70m' // Metric round, doesn't include 50yd
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'wa 70m',
        scores: [
          7, 7, 7, 7, 7, 7, // These are at 70m, not 50yd
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 195,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkRedAlertAt50ydAchieved - achievement found in current shoot', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current-shoot',
        date: '2023-06-01',
        gameType: 'windsor 50',
        scores: [
          // Red Alert end at 50yd
          7, 7, 7, 7, 7, 7,
          // Rest of the round
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ]
      },
      shootHistory: []
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.achievingShootId).toBe('current-shoot');
    expect(result.achievedDate).toBe('2023-06-01');
  });

  test('handles empty scores gracefully', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'windsor 50'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'windsor 50',
        scores: [],
        score: 0,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('handles missing game type gracefully', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [7, 7, 7, 7, 7, 7],
        gameType: undefined
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: undefined,
        scores: [7, 7, 7, 7, 7, 7],
        score: 42,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkRedAlertAt50ydAchieved - handles M and X scores correctly using convertToValues', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'windsor 50'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'windsor 50',
        scores: [
          // First end at 50yd - contains M and X, not Red Alert (M=0, X=10, both not 7)
          7, 7, 'M', 7, 'X', 7,
          // Second end at 50yd - Red Alert end (all 7s)
          7, 7, 7, 7, 7, 7,
          // Rest of the round
          9, 8, 7, 6, 5, 4,
          9, 9, 9, 8, 8, 8,
          8, 8, 7, 7, 6, 6,
          9, 8, 7, 6, 5, 4
        ],
        score: 195,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
  });
});