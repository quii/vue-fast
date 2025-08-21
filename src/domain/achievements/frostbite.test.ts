/**
 * Frostbite Achievement Tests
 * 
 * Tests for the Frostbite achievement system with 11 score thresholds
 */

import { describe, test, expect } from 'vitest';
import { 
  checkFrostbite200Achieved,
  checkFrostbite225Achieved,
  checkFrostbite250Achieved,
  checkFrostbite275Achieved,
  checkFrostbite300Achieved,
  checkFrostbite315Achieved,
  checkFrostbite325Achieved,
  checkFrostbite330Achieved,
  checkFrostbite340Achieved,
  checkFrostbite350Achieved,
  checkFrostbite355Achieved,
  FROSTBITE_ACHIEVEMENTS
} from './frostbite.js';
import type { AchievementContext } from './types.js';

function createTestContext(): AchievementContext {
  return {
    currentShoot: {
      scores: [8, 7, 6, 8, 7, 6],
      score: 280,
      gameType: 'frostbite',
    },
    shootHistory: [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [5, 4, 3, 5, 4, 3],
        score: 120,
        gameType: 'frostbite',
      },
      {
        id: 'shoot2', 
        date: '2023-01-02',
        scores: [6, 5, 4, 6, 5, 4],
        score: 180,
        gameType: 'national',
      }
    ]
  };
}

describe('Frostbite Achievement System', () => {
  test('generates 11 achievements with correct properties', () => {
    expect(FROSTBITE_ACHIEVEMENTS).toHaveLength(11);
    
    const expectedAchievements = [
      { id: 'frostbite_200', name: 'Frostbite 200', targetScore: 200, tier: 'bronze' },
      { id: 'frostbite_225', name: 'Frostbite 225', targetScore: 225, tier: 'bronze' },
      { id: 'frostbite_250', name: 'Frostbite 250', targetScore: 250, tier: 'bronze' },
      { id: 'frostbite_275', name: 'Frostbite 275', targetScore: 275, tier: 'silver' },
      { id: 'frostbite_300', name: 'Frostbite 300', targetScore: 300, tier: 'silver' },
      { id: 'frostbite_315', name: 'Frostbite 315', targetScore: 315, tier: 'gold' },
      { id: 'frostbite_325', name: 'Frostbite 325', targetScore: 325, tier: 'gold' },
      { id: 'frostbite_330', name: 'Frostbite 330', targetScore: 330, tier: 'gold' },
      { id: 'frostbite_340', name: 'Frostbite 340', targetScore: 340, tier: 'diamond' },
      { id: 'frostbite_350', name: 'Frostbite 350', targetScore: 350, tier: 'diamond' },
      { id: 'frostbite_355', name: 'Frostbite 355', targetScore: 355, tier: 'diamond' }
    ];
    
    expectedAchievements.forEach((expected, index) => {
      const achievement = FROSTBITE_ACHIEVEMENTS[index];
      expect(achievement.id).toBe(expected.id);
      expect(achievement.name).toBe(expected.name);
      expect(achievement.targetScore).toBe(expected.targetScore);
      expect(achievement.tier).toBe(expected.tier);
      expect(achievement.gameType).toBe('frostbite');
    });
  });
});

describe('Frostbite 200 (Bronze)', () => {
  test('does not unlock when score is below 200', () => {
    const context = createTestContext();
    context.currentShoot.score = 190;
    // Clear history so we're only testing current shoot
    context.shootHistory = [];
    
    const progress = checkFrostbite200Achieved(context);
    
    expect(progress.currentScore).toBe(190);
    expect(progress.targetScore).toBe(200);
    expect(progress.isUnlocked).toBe(false);
    expect(progress.unlockedAt).toBeUndefined();
  });

  test('unlocks when current shoot scores 200+ on Frostbite', () => {
    const context = createTestContext();
    context.currentShoot.score = 210;
    context.currentShoot.gameType = 'frostbite';
    // Clear history so we're only testing current shoot
    context.shootHistory = [];
    
    const progress = checkFrostbite200Achieved(context);
    
    expect(progress.currentScore).toBe(210);
    expect(progress.targetScore).toBe(200);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('unlocks when historical shoot has 200+ on Frostbite', () => {
    const context = createTestContext();
    context.currentShoot.score = 150;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [8, 8, 8, 8, 8, 8],
        score: 220,
        gameType: 'frostbite',
      }
    ];
    
    const progress = checkFrostbite200Achieved(context);
    
    expect(progress.currentScore).toBe(220);
    expect(progress.targetScore).toBe(200);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBe('2023-01-01');
    expect(progress.achievingShootId).toBe('shoot1');
  });

  test('does not unlock on non-Frostbite rounds', () => {
    const context = createTestContext();
    context.currentShoot.score = 250;
    context.currentShoot.gameType = 'national';
    // Clear history so we're only testing current shoot
    context.shootHistory = [];
    
    const progress = checkFrostbite200Achieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Frostbite 275 (Silver)', () => {
  test('unlocks when current shoot scores 275+ on Frostbite', () => {
    const context = createTestContext();
    context.currentShoot.score = 280;
    context.currentShoot.gameType = 'frostbite';
    
    const progress = checkFrostbite275Achieved(context);
    
    expect(progress.currentScore).toBe(280);
    expect(progress.targetScore).toBe(275);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 275', () => {
    const context = createTestContext();
    context.currentShoot.score = 270;
    
    const progress = checkFrostbite275Achieved(context);
    
    expect(progress.currentScore).toBe(270);
    expect(progress.targetScore).toBe(275);
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Frostbite 355 (Diamond)', () => {
  test('unlocks when current shoot scores 355+ on Frostbite', () => {
    const context = createTestContext();
    context.currentShoot.score = 360;
    context.currentShoot.gameType = 'frostbite';
    
    const progress = checkFrostbite355Achieved(context);
    
    expect(progress.currentScore).toBe(360);
    expect(progress.targetScore).toBe(355);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 355', () => {
    const context = createTestContext();
    context.currentShoot.score = 350;
    
    const progress = checkFrostbite355Achieved(context);
    
    expect(progress.currentScore).toBe(350);
    expect(progress.targetScore).toBe(355);
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Case insensitive game type matching', () => {
  test('unlocks with uppercase Frostbite game type', () => {
    const context = createTestContext();
    context.currentShoot.score = 300;
    context.currentShoot.gameType = 'FROSTBITE';
    
    const progress = checkFrostbite300Achieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('unlocks with mixed case Frostbite game type', () => {
    const context = createTestContext();
    context.currentShoot.score = 315;
    context.currentShoot.gameType = 'Frostbite';
    
    const progress = checkFrostbite315Achieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });
});

describe('Historical achievement tracking', () => {
  test('tracks best score from history when not achieved', () => {
    const context = createTestContext();
    context.currentShoot.score = 100;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [7, 7, 7, 7, 7, 7],
        score: 190,
        gameType: 'frostbite',
      },
      {
        id: 'shoot2',
        date: '2023-01-02',
        scores: [6, 6, 6, 6, 6, 6],
        score: 170,
        gameType: 'frostbite',
      }
    ];
    
    const progress = checkFrostbite200Achieved(context);
    
    expect(progress.currentScore).toBe(190);
    expect(progress.targetScore).toBe(200);
    expect(progress.isUnlocked).toBe(false);
  });
});