/**
 * 720 Mastery (Recurve) Achievement Tests
 * 
 * Tests for the 4-tier achievement system for WA 70m rounds with recurve bow
 */

import { describe, test, expect } from 'vitest';
import { 
  check720MasteryBronzeAchieved,
  check720MasterySilverAchieved,
  check720MasteryGoldAchieved,
  check720MasteryDiamondAchieved,
  SEVEN_TWENTY_MASTERY_ACHIEVEMENTS
} from './seven_twenty_mastery_recurve.js';
import type { AchievementContext } from './types.js';

function createTestContext(): AchievementContext {
  return {
    currentShoot: {
      scores: [9, 8, 7, 9, 8, 7],
      score: 480,
      gameType: 'wa 70m',
      userProfile: { bowType: 'recurve' }
    },
    shootHistory: [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [8, 7, 6, 8, 7, 6],
        score: 420,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      },
      {
        id: 'shoot2', 
        date: '2023-01-02',
        scores: [7, 6, 5, 7, 6, 5],
        score: 360,
        gameType: 'national',
        userProfile: { bowType: 'recurve' }
      }
    ]
  };
}

describe('720 Mastery Achievement System', () => {
  test('generates 4 achievements with correct properties', () => {
    expect(SEVEN_TWENTY_MASTERY_ACHIEVEMENTS).toHaveLength(4);
    
    const expectedAchievements = [
      { id: 'seven_twenty_mastery_recurve_bronze', name: '450 @ 720 (Recurve)', targetScore: 450, tier: 'bronze' },
      { id: 'seven_twenty_mastery_recurve_silver', name: '500 @ 720 (Recurve)', targetScore: 500, tier: 'silver' },
      { id: 'seven_twenty_mastery_recurve_gold', name: '550 @ 720 (Recurve)', targetScore: 550, tier: 'gold' },
      { id: 'seven_twenty_mastery_recurve_diamond', name: '600 @ 720 (Recurve)', targetScore: 600, tier: 'diamond' }
    ];
    
    expectedAchievements.forEach((expected, index) => {
      const achievement = SEVEN_TWENTY_MASTERY_ACHIEVEMENTS[index];
      expect(achievement.id).toBe(expected.id);
      expect(achievement.name).toBe(expected.name);
      expect(achievement.targetScore).toBe(expected.targetScore);
      expect(achievement.tier).toBe(expected.tier);
      expect(achievement.gameType).toBe('wa 70m');
    });
  });
});

describe('Bronze Tier (450 score)', () => {
  test('does not unlock when score is below 450', () => {
    const context = createTestContext();
    context.currentShoot.score = 440;
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(440);
    expect(progress.targetScore).toBe(450);
    expect(progress.isUnlocked).toBe(false);
    expect(progress.unlockedAt).toBeUndefined();
  });

  test('unlocks when current shoot scores 450+ on WA 70m with recurve', () => {
    const context = createTestContext();
    context.currentShoot.score = 460;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(460);
    expect(progress.targetScore).toBe(450);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('unlocks when historical shoot has 450+ on WA 70m with recurve', () => {
    const context = createTestContext();
    context.currentShoot.score = 400;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [10, 10, 10, 10, 10, 10],
        score: 470,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      },
      {
        id: 'shoot2',
        date: '2023-01-02', 
        scores: [8, 7, 6, 8, 7, 6],
        score: 420,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(470);
    expect(progress.targetScore).toBe(450);
    expect(progress.isUnlocked).toBe(true);
  });

  test('does not unlock for high scores on different rounds', () => {
    const context = createTestContext();
    context.currentShoot.score = 480;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [9, 9, 9, 9, 9, 9],
        score: 500,
        gameType: 'national',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(0); // No WA 70m shoots
    expect(progress.isUnlocked).toBe(false);
  });

  test('does not unlock for high scores with different bow types', () => {
    const context = createTestContext();
    context.currentShoot.score = 480;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'compound' };
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [9, 9, 9, 9, 9, 9],
        score: 500,
        gameType: 'wa 70m',
        userProfile: { bowType: 'compound' }
      }
    ];
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(0); // No recurve WA 70m shoots
    expect(progress.isUnlocked).toBe(false);
  });

  test('finds best WA 70m recurve score across all shoots', () => {
    const context = createTestContext();
    context.currentShoot.score = 440;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [],
        score: 430,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      },
      {
        id: 'shoot2',
        date: '2023-01-02',
        scores: [],
        score: 420,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      },
      {
        id: 'shoot3',
        date: '2023-01-03',
        scores: [],
        score: 500,
        gameType: 'national', // Different round, shouldn't count
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(440); // Best WA 70m recurve score
    expect(progress.isUnlocked).toBe(false);
  });

  test('handles case insensitive game type matching', () => {
    const context = createTestContext();
    context.currentShoot.score = 460;
    context.currentShoot.gameType = 'WA 70M'; // Different case
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });
});

describe('Silver Tier (500 score)', () => {
  test('unlocks when current shoot scores 500+ on WA 70m with recurve', () => {
    const context = createTestContext();
    context.currentShoot.score = 520;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(520);
    expect(progress.targetScore).toBe(500);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 500', () => {
    const context = createTestContext();
    context.currentShoot.score = 490;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(490);
    expect(progress.targetScore).toBe(500);
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Gold Tier (550 score)', () => {
  test('unlocks when current shoot scores 550+ on WA 70m with recurve', () => {
    const context = createTestContext();
    context.currentShoot.score = 570;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryGoldAchieved(context);
    
    expect(progress.currentScore).toBe(570);
    expect(progress.targetScore).toBe(550);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 550', () => {
    const context = createTestContext();
    context.currentShoot.score = 540;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryGoldAchieved(context);
    
    expect(progress.currentScore).toBe(540);
    expect(progress.targetScore).toBe(550);
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Diamond Tier (600 score)', () => {
  test('unlocks when current shoot scores 600+ on WA 70m with recurve', () => {
    const context = createTestContext();
    context.currentShoot.score = 620;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryDiamondAchieved(context);
    
    expect(progress.currentScore).toBe(620);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 600', () => {
    const context = createTestContext();
    context.currentShoot.score = 590;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryDiamondAchieved(context);
    
    expect(progress.currentScore).toBe(590);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(false);
  });

  test('replaces the old 600 at WA70 achievement functionality', () => {
    // This test verifies that the diamond tier (600 score) preserves
    // the same functionality as the old single achievement
    const context = createTestContext();
    context.currentShoot.score = 610;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    
    const progress = check720MasteryDiamondAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.targetScore).toBe(600);
    expect(progress.currentScore).toBe(610);
  });
});

describe('Bow Type Validation', () => {
  test('requires recurve bow type in current shoot', () => {
    const context = createTestContext();
    context.currentShoot.score = 500;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'compound' };
    // Clear history so only current shoot matters
    context.shootHistory = [];
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.currentScore).toBe(0);
  });

  test('requires recurve bow type in historical shoots', () => {
    const context = createTestContext();
    context.currentShoot.score = 400;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [],
        score: 520,
        gameType: 'wa 70m',
        userProfile: { bowType: 'compound' }
      },
      {
        id: 'shoot2',
        date: '2023-01-02',
        scores: [],
        score: 480,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(480); // Only the recurve shoot counts
    expect(progress.isUnlocked).toBe(false); // 480 < 500
  });

  test('handles missing bow type in current shoot', () => {
    const context = createTestContext();
    context.currentShoot.score = 500;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = undefined;
    // Clear history so only current shoot matters
    context.shootHistory = [];
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.currentScore).toBe(0);
  });

  test('handles missing bow type in historical shoots', () => {
    const context = createTestContext();
    context.currentShoot.score = 400;
    context.currentShoot.gameType = 'national';
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [],
        score: 520,
        gameType: 'wa 70m',
        userProfile: undefined
      },
      {
        id: 'shoot2',
        date: '2023-01-02',
        scores: [],
        score: 480,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(480); // Only the shoot with bow type counts
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Game Type Validation', () => {
  test('only counts WA 70m rounds', () => {
    const context = createTestContext();
    context.currentShoot.score = 500;
    context.currentShoot.gameType = 'national';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [],
        score: 520,
        gameType: 'national',
        userProfile: { bowType: 'recurve' }
      },
      {
        id: 'shoot2',
        date: '2023-01-02',
        scores: [],
        score: 480,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(480); // Only WA 70m shoot counts
    expect(progress.isUnlocked).toBe(false);
  });

  test('handles missing game type', () => {
    const context = createTestContext();
    context.currentShoot.score = 500;
    context.currentShoot.gameType = undefined;
    context.currentShoot.userProfile = { bowType: 'recurve' };
    // Clear history so only current shoot matters
    context.shootHistory = [];
    
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.currentScore).toBe(0);
  });
});

describe('Score Tracking', () => {
  test('tracks best score across current and historical shoots', () => {
    const context = createTestContext();
    context.currentShoot.score = 460;
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [],
        score: 440,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      },
      {
        id: 'shoot2',
        date: '2023-01-02',
        scores: [],
        score: 470,
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(470); // Best score across all
    expect(progress.isUnlocked).toBe(true); // 470 >= 450
  });

  test('handles missing scores gracefully', () => {
    const context = createTestContext();
    context.currentShoot.score = 0; // Use 0 instead of undefined for score
    context.currentShoot.gameType = 'wa 70m';
    context.currentShoot.userProfile = { bowType: 'recurve' };
    context.shootHistory = [
      {
        id: 'shoot1',
        date: '2023-01-01',
        scores: [],
        score: 0, // Use 0 instead of undefined for score
        gameType: 'wa 70m',
        userProfile: { bowType: 'recurve' }
      }
    ];
    
    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(0);
    expect(progress.isUnlocked).toBe(false);
  });
});
