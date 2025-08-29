/**
 * 720 Mastery (Recurve) Achievement Tests
 * 
 * Tests for the 4-tier achievement system for WA 70m rounds with recurve bow
 */

import { describe, expect, test } from 'vitest'
import {
  check720MasteryBronzeAchieved,
  check720MasteryDiamondAchieved,
  check720MasteryGoldAchieved,
  check720MasterySilverAchieved,
  SEVEN_TWENTY_MASTERY_ACHIEVEMENTS
} from './seven_twenty_mastery_recurve.js'

describe('720 Mastery Achievement System', () => {
  test('generates 4 achievements with correct properties', () => {
    expect(SEVEN_TWENTY_MASTERY_ACHIEVEMENTS).toHaveLength(4)

    const expectedAchievements = [
      {
        id: 'seven_twenty_mastery_recurve_bronze',
        name: '450 @ 720 (Recurve)',
        targetScore: 450,
        tier: 'bronze'
      },
      {
        id: 'seven_twenty_mastery_recurve_silver',
        name: '500 @ 720 (Recurve)',
        targetScore: 500,
        tier: 'silver'
      },
      {
        id: 'seven_twenty_mastery_recurve_gold',
        name: '550 @ 720 (Recurve)',
        targetScore: 550,
        tier: 'gold'
      },
      {
        id: 'seven_twenty_mastery_recurve_diamond',
        name: '600 @ 720 (Recurve)',
        targetScore: 600,
        tier: 'diamond'
      }
    ]

    expectedAchievements.forEach((expected, index) => {
      const achievement = SEVEN_TWENTY_MASTERY_ACHIEVEMENTS[index]
      expect(achievement.id).toBe(expected.id)
      expect(achievement.name).toBe(expected.name)
      expect(achievement.targetScore).toBe(expected.targetScore)
      expect(achievement.tier).toBe(expected.tier)
      expect(achievement.gameType).toBe('wa 70m')
    })
  })
})

describe('Bronze Tier (450 score)', () => {
  test('does not unlock when score is below 450', () => {
    const context = {
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

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(420);
    expect(progress.targetScore).toBe(450);
    expect(progress.isUnlocked).toBe(false);
    expect(progress.unlockedAt).toBeUndefined();
  });

  test('unlocks when current shoot scores 450+ on WA 70m with recurve', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 460,
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

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(460);
    expect(progress.targetScore).toBe(450);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('unlocks when historical shoot has 450+ on WA 70m with recurve', () => {
    const context = {
      shootHistory: [
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
      ]    };

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(470);
    expect(progress.targetScore).toBe(450);
    expect(progress.isUnlocked).toBe(true);
  });

  test('does not unlock for high scores on different rounds', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [9, 9, 9, 9, 9, 9],
          score: 500,
          gameType: 'national',
          userProfile: { bowType: 'recurve' }
        }
      ]
    };

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(0); // No WA 70m shoots
    expect(progress.isUnlocked).toBe(false);
  });

  test('does not unlock for high scores with different bow types', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [9, 9, 9, 9, 9, 9],
          score: 500,
          gameType: 'wa 70m',
          userProfile: { bowType: 'compound' }
        }
      ]    };

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(0); // No recurve WA 70m shoots
    expect(progress.isUnlocked).toBe(false);
  });

  test('finds best WA 70m recurve score across all shoots', () => {
    const context = {
      shootHistory: [
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
      ]
    };

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(430); // Best WA 70m recurve score
    expect(progress.isUnlocked).toBe(false);
  });

});

describe('Silver Tier (500 score)', () => {
  test('unlocks when current shoot scores 500+ on WA 70m with recurve', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 520,
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

    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(520);
    expect(progress.targetScore).toBe(500);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 500', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 490,
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

    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.currentScore).toBe(490);
    expect(progress.targetScore).toBe(500);
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Gold Tier (550 score)', () => {
  test('unlocks when scores 550+ on WA 70m with recurve', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 570,
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

    const progress = check720MasteryGoldAchieved(context);
    
    expect(progress.currentScore).toBe(570);
    expect(progress.targetScore).toBe(550);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 550', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 540,
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

    const progress = check720MasteryGoldAchieved(context);
    
    expect(progress.currentScore).toBe(540);
    expect(progress.targetScore).toBe(550);
    expect(progress.isUnlocked).toBe(false);
  });
});

describe('Diamond Tier (600 score)', () => {
  test('unlocks when current shoot scores 600+ on WA 70m with recurve', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 620,
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

    const progress = check720MasteryDiamondAchieved(context);
    
    expect(progress.currentScore).toBe(620);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBeDefined();
  });

  test('does not unlock when score is below 600', () => {
    const context = {
      shootHistory: [
        {
          id: 'shoot1',
          date: '2023-01-01',
          scores: [8, 7, 6, 8, 7, 6],
          score: 590,
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

    const progress = check720MasteryDiamondAchieved(context);
    
    expect(progress.currentScore).toBe(590);
    expect(progress.targetScore).toBe(600);
    expect(progress.isUnlocked).toBe(false);
  });

});

describe('Bow Type Validation', () => {
  test('requires recurve bow type in current shoot', () => {
    const context = {
      shootHistory: [
        {
          score: 420,
          gameType: 'wa 70m',
          userProfile: { bowType: 'compound' }
        },
        {
          score: 360,
          gameType: 'wa 70m',
          userProfile: { bowType: 'recurve' }
        }
      ]
    };
    const progress = check720MasterySilverAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.currentScore).toBe(360);
  });

});

describe('Score Tracking', () => {
  test('tracks best score across current and historical shoots', () => {
    const context = {
      shootHistory: [
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
      ]    };

    const progress = check720MasteryBronzeAchieved(context);
    
    expect(progress.currentScore).toBe(470); // Best score across all
    expect(progress.isUnlocked).toBe(true); // 470 >= 450
  });
});
