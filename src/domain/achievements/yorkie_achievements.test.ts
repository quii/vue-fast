/**
 * Unit tests for Yorkie achievements
 */

import { describe, test, expect } from 'vitest';
import type { AchievementContext } from './types';
import { 
  checkSmashThePatriarchyAchieved,
  checkYorkieNotForGirlsAchieved,
  checkYorkieForGirlsSilverAchieved,
  checkYorkieForGirlsGoldAchieved,
  checkYorkieForGirlsDiamondAchieved,
  YORKIE_ACHIEVEMENTS
} from './yorkie_achievements';

function createYorkContext(
  currentShootData: {
    scores: any[];
    gameType: string;
    userProfile?: { gender?: string };
  },
  historyData: Array<{
    id: number;
    date: string;
    scores: any[];
    gameType: string;
    userProfile?: { gender?: string };
    score?: number;
  }> = []
): AchievementContext {
  return {
    currentShoot: {
      scores: currentShootData.scores,
      gameType: currentShootData.gameType,
      userProfile: currentShootData.userProfile
    },
    shootHistory: historyData
  };
}

describe('Yorkie Achievements', () => {
  describe('Achievement definitions', () => {
    test('should create all 5 Yorkie achievements with correct properties', () => {
      expect(YORKIE_ACHIEVEMENTS).toHaveLength(5);
      
      const achievementIds = YORKIE_ACHIEVEMENTS.map(a => a.id);
      expect(achievementIds).toContain('smash_the_patriarchy');
      expect(achievementIds).toContain('yorkie_not_for_girls');
      expect(achievementIds).toContain('yorkie_for_girls_silver');
      expect(achievementIds).toContain('yorkie_for_girls_gold');
      expect(achievementIds).toContain('yorkie_for_girls_diamond');
      
      // Check tiers
      const smashPatriarchy = YORKIE_ACHIEVEMENTS.find(a => a.id === 'smash_the_patriarchy');
      expect(smashPatriarchy?.tier).toBe('diamond');
      
      const notForGirls = YORKIE_ACHIEVEMENTS.find(a => a.id === 'yorkie_not_for_girls');
      expect(notForGirls?.tier).toBe('bronze');
      
      const forGirlsSilver = YORKIE_ACHIEVEMENTS.find(a => a.id === 'yorkie_for_girls_silver');
      expect(forGirlsSilver?.tier).toBe('silver');
    });
  });

  describe('Smash the Patriarchy Achievement', () => {
    test('should unlock when female archer completes a York round', () => {
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: Array(144).fill(5), // Full York round (6+4+2 dozen = 144 arrows)
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkSmashThePatriarchyAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.currentScore).toBe(1);
      expect(result.targetScore).toBe(1);
    });

    test('should not unlock for male archers', () => {
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: Array(144).fill(5),
        gameType: 'york',
        userProfile: { gender: 'male' }
      }]);

      const result = checkSmashThePatriarchyAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
    });

    test('should not unlock for non-York rounds', () => {
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: Array(144).fill(5),
        gameType: 'national',
        userProfile: { gender: 'female' }
      }]);

      const result = checkSmashThePatriarchyAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
    });

    test('should unlock from history if female archer previously shot York', () => {
      const context: AchievementContext = createYorkContext(
        {
          scores: [],
          gameType: 'national',
          userProfile: { gender: 'female' }
        },
        [{
          id: 1,
          date: '2024-01-01',
          scores: Array(144).fill(5),
          gameType: 'york',
          userProfile: { gender: 'female' },
          score: 720
        }]
      );

      const result = checkSmashThePatriarchyAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.achievingShootId).toBe(1);
      expect(result.achievedDate).toBe('2024-01-01');
    });
  });

  describe('Yorkie Not For Girls Achievement (Score 0 in an end at 100 yards)', () => {
    test('should unlock when female archer scores 0 in an end at 100 yards', () => {
      // Create scores with one end of all misses at 100 yards (first 6 arrows)
      const scores: any[] = ['M', 'M', 'M', 'M', 'M', 'M', ...Array(138).fill(5)];
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieNotForGirlsAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.currentScore).toBe(0);
      expect(result.targetScore).toBe(0);
    });

    test('should not unlock when all ends have scores above 0', () => {
      // All ends have at least one scoring arrow
      const scores: any[] = Array(72).fill(1).concat(Array(72).fill(5)); // 100yd + others
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieNotForGirlsAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
      expect(result.currentScore).toBeGreaterThan(0);
    });

    test('should not unlock for male archers', () => {
      const scores: any[] = ['M', 'M', 'M', 'M', 'M', 'M', ...Array(138).fill(5)];
      
      const context: AchievementContext = createYorkContext({
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'male' }
      });

      const result = checkYorkieNotForGirlsAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
    });
  });

  describe('Yorkie For Girls Silver Achievement (Score over 25 in an end at 100 yards)', () => {
    test('should unlock when female archer scores 26+ in an end at 100 yards', () => {
      // Create an end that scores exactly 26 (first 6 arrows at 100 yards)
      const scores: any[] = [5, 5, 5, 5, 3, 3, ...Array(138).fill(1)]; // 26 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsSilverAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.currentScore).toBe(26);
      expect(result.targetScore).toBe(26);
    });

    test('should not unlock when best end scores 25 or less', () => {
      // Best end scores exactly 25
      const scores: any[] = [5, 5, 5, 5, 5, 0, ...Array(138).fill(1)]; // 25 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsSilverAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
      expect(result.currentScore).toBe(25);
    });

    test('should not unlock for male archers', () => {
      const scores: any[] = [9, 9, 9, 9, 9, 9, ...Array(138).fill(1)]; // 54 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'male' }
      }]);

      const result = checkYorkieForGirlsSilverAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
    });
  });

  describe('Yorkie For Girls Gold Achievement (Score over 32 in an end at 100 yards)', () => {
    test('should unlock when female archer scores 33+ in an end at 100 yards', () => {
      // Create an end that scores exactly 33 (first 6 arrows at 100 yards)
      const scores: any[] = [7, 7, 7, 5, 5, 2, ...Array(138).fill(1)]; // 33 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsGoldAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.currentScore).toBe(33);
      expect(result.targetScore).toBe(33);
    });

    test('should not unlock when best end scores 32 or less', () => {
      const scores: any[] = [7, 7, 7, 5, 3, 3, ...Array(138).fill(1)]; // 32 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsGoldAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
      expect(result.currentScore).toBe(32);
    });
  });

  describe('Yorkie For Girls Diamond Achievement (Score over 41 in an end at 100 yards)', () => {
    test('should unlock when female archer scores 42+ in an end at 100 yards', () => {
      // Create an end that scores exactly 42 (first 6 arrows at 100 yards)
      const scores: any[] = [9, 9, 7, 7, 5, 5, ...Array(138).fill(1)]; // 42 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsDiamondAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.currentScore).toBe(42);
      expect(result.targetScore).toBe(42);
    });

    test('should not unlock when best end scores 41 or less', () => {
      const scores: any[] = [9, 9, 7, 7, 5, 4, ...Array(138).fill(1)]; // 41 points
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsDiamondAchieved(context);
      
      expect(result.isUnlocked).toBe(false);
      expect(result.currentScore).toBe(41);
    });

    test('should unlock with perfect end (54 points)', () => {
      const scores: any[] = [9, 9, 9, 9, 9, 9, ...Array(138).fill(1)]; // 54 points (golden end)
      
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: scores,
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkYorkieForGirlsDiamondAchieved(context);
      
      expect(result.isUnlocked).toBe(true);
      expect(result.currentScore).toBe(54);
    });
  });

  describe('Gender recognition', () => {
    test('should recognize female gender', () => {
      const context: AchievementContext = createYorkContext({
        scores: [],
        gameType: '',
      }, [{
        id: 1,
        date: '2023-01-01',
        scores: Array(144).fill(5),
        gameType: 'york',
        userProfile: { gender: 'female' }
      }]);

      const result = checkSmashThePatriarchyAchieved(context);
      expect(result.isUnlocked).toBe(true);
    });

    test('should not recognize male gender as female', () => {
      const context: AchievementContext = createYorkContext({
        scores: Array(144).fill(5),
        gameType: 'york',
        userProfile: { gender: 'male' }
      });

      const result = checkSmashThePatriarchyAchieved(context);
      expect(result.isUnlocked).toBe(false);
    });

    test('should not recognize undefined gender as female', () => {
      const context: AchievementContext = createYorkContext({
        scores: Array(144).fill(5),
        gameType: 'york',
        userProfile: { }
      });

      const result = checkSmashThePatriarchyAchieved(context);
      expect(result.isUnlocked).toBe(false);
    });
  });

  describe('Historical achievements', () => {
    test('should find achievements from shoot history', () => {
      const context: AchievementContext = createYorkContext(
        {
          scores: [],
          gameType: 'national',
          userProfile: { gender: 'female' }
        },
        [{
          id: 123,
          date: '2024-06-15',
          scores: [9, 9, 9, 9, 9, 9, ...Array(138).fill(1)], // Golden end at 100yd
          gameType: 'york',
          userProfile: { gender: 'female' },
          score: 720
        }]
      );

      const diamondResult = checkYorkieForGirlsDiamondAchieved(context);
      expect(diamondResult.isUnlocked).toBe(true);
      expect(diamondResult.achievingShootId).toBe(123);
      expect(diamondResult.achievedDate).toBe('2024-06-15');
      expect(diamondResult.currentScore).toBe(54);
    });

    test('should not unlock from male archer history even with high scores', () => {
      const context: AchievementContext = createYorkContext(
        {
          scores: [],
          gameType: 'national',
          userProfile: { gender: 'female' }
        },
        [{
          id: 123,
          date: '2024-06-15',
          scores: [9, 9, 9, 9, 9, 9, ...Array(138).fill(1)], // Golden end at 100yd
          gameType: 'york',
          userProfile: { gender: 'male' }, // Male archer
          score: 720
        }]
      );

      const diamondResult = checkYorkieForGirlsDiamondAchieved(context);
      expect(diamondResult.isUnlocked).toBe(false);
    });
  });
});