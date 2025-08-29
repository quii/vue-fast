/**
 * Tests for Cushty Pompey! Achievement Group
 */

import { describe, it, expect } from 'vitest';
import { 
  CUSHTY_POMPEY_ACHIEVEMENTS,
  checkCushtyPompey300Achieved,
  checkCushtyPompey325Achieved,
  checkCushtyPompey400Achieved,
  checkCushtyPompey500Achieved,
  checkCushtyPompey600Achieved
} from './cushty_pompey_achievements.js';
import type { AchievementContext } from './types.js';
import { getAllAchievements } from './registry.js';

describe('Cushty Pompey! Achievement Group', () => {
  it('should have all 17 Portsmouth score threshold achievements', () => {
    expect(CUSHTY_POMPEY_ACHIEVEMENTS).toHaveLength(17);
    
    const expectedScores = [300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 580, 585, 590, 595, 600];
    const actualScores = CUSHTY_POMPEY_ACHIEVEMENTS.map(a => a.targetScore).sort((a, b) => a! - b!);
    
    expect(actualScores).toEqual(expectedScores);
  });

  it('should have correct tier assignments based on score ranges', () => {
    // Bronze: 300-350
    const bronze300 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 300);
    const bronze350 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 350);
    expect(bronze300?.tier).toBe('bronze');
    expect(bronze350?.tier).toBe('bronze');

    // Silver: 375-450
    const silver375 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 375);
    const silver450 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 450);
    expect(silver375?.tier).toBe('silver');
    expect(silver450?.tier).toBe('silver');

    // Gold: 475-550
    const gold475 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 475);
    const gold550 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 550);
    expect(gold475?.tier).toBe('gold');
    expect(gold550?.tier).toBe('gold');

    // Diamond: 575-600
    const diamond575 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 575);
    const diamond600 = CUSHTY_POMPEY_ACHIEVEMENTS.find(a => a.targetScore === 600);
    expect(diamond575?.tier).toBe('diamond');
    expect(diamond600?.tier).toBe('diamond');
  });

  it('should all be Portsmouth gameType achievements', () => {
    CUSHTY_POMPEY_ACHIEVEMENTS.forEach(achievement => {
      expect(achievement.gameType).toBe('portsmouth');
    });
  });
});

describe('checkCushtyPompey300Achieved', () => {
  it('should unlock achievement when current shoot scores 300+ on Portsmouth', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        gameType: 'portsmouth',
        score: 300
      }]
    };

    const result = checkCushtyPompey300Achieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(300);
    expect(result.targetScore).toBe(300);
    expect(result.achievingShootId).toBe('current');
    expect(result.achievedDate).toBe('2023-01-15');
  });

  it('should not unlock achievement when current shoot scores less than 300', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        score: 240,
        gameType: 'portsmouth'
      }]
    };

    const result = checkCushtyPompey300Achieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(240);
    expect(result.targetScore).toBe(300);
  });

  it('should ignore non-Portsmouth rounds', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: Array(30).fill(10), // High scores but wrong round
        gameType: 'bray i'
      },
      shootHistory: [
        {
          id: 1,
          date: '2023-01-01',
          scores: Array(72).fill(10), // High scores but wrong round
          gameType: 'national'
        }
      ]
    };

    const result = checkCushtyPompey300Achieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(0); // No Portsmouth rounds found
  });

  it('should handle mixed numeric and string scores correctly', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        score: 310,
        gameType: 'portsmouth'
      }]
    };

    const result = checkCushtyPompey300Achieved(context);
    
    // 10+9+8+0+7+6+(54*5) = 40+270 = 310
    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(310);
  });
});

describe('checkCushtyPompey400Achieved', () => {
  it('should unlock silver achievement when scoring 400+', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        score: 400,
        gameType: 'portsmouth'
      }]
    };

    const result = checkCushtyPompey400Achieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(400);
    expect(result.targetScore).toBe(400);
  });

  it('should show progress toward 400 when scoring less', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        score: 360,
        gameType: 'portsmouth'
      }]
    };

    const result = checkCushtyPompey400Achieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(360);
    expect(result.targetScore).toBe(400);
  });
});

describe('checkCushtyPompey600Achieved', () => {
  it('should unlock diamond achievement when scoring perfect 600', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        score: 600,
        gameType: 'portsmouth'
      }]
    };

    const result = checkCushtyPompey600Achieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.currentScore).toBe(600);
    expect(result.targetScore).toBe(600);
  });

  it('should not unlock when just short of perfect', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'current',
        date: '2023-01-15',
        score: 599,
        gameType: 'portsmouth'
      }]
    };

    const result = checkCushtyPompey600Achieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(599);
    expect(result.targetScore).toBe(600);
  });
});

describe('Portsmouth achievements progress tracking', () => {
  it('should track best score across current shoot and history', () => {
    const context: AchievementContext = {
      shootHistory: [
        {
          id: 1,
          date: '2023-01-01',
          gameType: 'portsmouth',
          score: 360
        },
        {
          id: 2,
          date: '2023-01-10',
          gameType: 'portsmouth',
          score: 480
        }
      ]
    };

    const result = checkCushtyPompey500Achieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(480); // Best score from history
    expect(result.targetScore).toBe(500);
  });

  it('should handle empty scores arrays gracefully', () => {
    const context: AchievementContext = {
      currentShoot: {
        id: 'current',
        date: '2023-01-15',
        scores: [],
        gameType: 'portsmouth'
      },
      shootHistory: []
    };

    const result = checkCushtyPompey300Achieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.currentScore).toBe(0);
    expect(result.targetScore).toBe(300);
  });
});

describe('Cushty Pompey achievements integration', () => {
  it('should be included in the achievement registry', () => {
    const allAchievements = getAllAchievements();
    const cushtyPompeyAchievementIds = CUSHTY_POMPEY_ACHIEVEMENTS.map(a => a.id);
    
    cushtyPompeyAchievementIds.forEach(id => {
      const achievement = allAchievements.find(a => a.id === id);
      expect(achievement).toBeDefined();
      expect(achievement?.name).toContain('Cushty Pompey!');
    });
  });

  it('should have correct Portsmouth gameType for all achievements', () => {
    CUSHTY_POMPEY_ACHIEVEMENTS.forEach(achievement => {
      expect(achievement.gameType).toBe('portsmouth');
      expect(achievement.group?.id).toBe('cushty_pompey');
    });
  });
});