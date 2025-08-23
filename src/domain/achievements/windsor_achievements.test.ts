/**
 * Tests for For the Windsor Achievement Group
 */

import { describe, it, expect } from 'vitest';
import { 
  isNineDozensImperialRound,
  checkForTheWindsorBronzeAchieved,
  checkForTheWindsorSilverAchieved,
  checkForTheWindsorGoldAchieved,
  checkForTheWindsorDiamondAchieved,
  WINDSOR_ACHIEVEMENTS
} from './windsor_achievements.js';
import type { AchievementContext } from './types.js';
import { getAllAchievements } from './registry.js';

describe('isNineDozensImperialRound', () => {
  it('should identify Windsor as a 9 dozen imperial round', () => {
    expect(isNineDozensImperialRound('Windsor')).toBe(true);
  });

  it('should identify Windsor 50 as a 9 dozen imperial round', () => {
    expect(isNineDozensImperialRound('Windsor 50')).toBe(true);
  });

  it('should identify Windsor 40 as a 9 dozen imperial round', () => {
    expect(isNineDozensImperialRound('Windsor 40')).toBe(true);
  });

  it('should identify Windsor 30 as a 9 dozen imperial round', () => {
    expect(isNineDozensImperialRound('Windsor 30')).toBe(true);
  });

  it('should identify St. George as a 9 dozen imperial round', () => {
    expect(isNineDozensImperialRound('St. George')).toBe(true);
  });

  it('should identify Albion / Long Windsor as a 9 dozen imperial round', () => {
    expect(isNineDozensImperialRound('Albion / Long Windsor')).toBe(true);
  });

  it('should reject National as not 9 dozen (6 dozen total)', () => {
    expect(isNineDozensImperialRound('National')).toBe(false);
  });

  it('should reject York as not 9 dozen (12 dozen total)', () => {
    expect(isNineDozensImperialRound('York')).toBe(false);
  });

  it('should reject WA 70m as not imperial', () => {
    expect(isNineDozensImperialRound('WA 70m')).toBe(false);
  });

  it('should return false for non-existent round', () => {
    expect(isNineDozensImperialRound('Non-existent Round')).toBe(false);
  });
});

describe('checkForTheWindsorBronzeAchieved', () => {
  it('should unlock bronze achievement when 5 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { id: 1, gameType: 'Windsor', scores: Array(108).fill(5), date: '2023-01-01' },
        { id: 2, gameType: 'Windsor 50', scores: Array(108).fill(5), date: '2023-01-02' },
        { id: 3, gameType: 'St. George', scores: Array(108).fill(5), date: '2023-01-03' },
        { id: 4, gameType: 'Windsor 40', scores: Array(108).fill(5), date: '2023-01-04' },
        { id: 5, gameType: 'Windsor 30', scores: Array(108).fill(5), date: '2023-01-05' }
      ]
    };

    const result = checkForTheWindsorBronzeAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(5);
    expect(result.targetArrows).toBe(5);
    expect(result.achievingShootId).toBe(5);
    expect(result.achievedDate).toBe('2023-01-05');
  });

  it('should not unlock bronze achievement when only 4 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { id: 1, gameType: 'Windsor', scores: Array(108).fill(5), date: '2023-01-01' },
        { id: 2, gameType: 'Windsor 50', scores: Array(108).fill(5), date: '2023-01-02' },
        { id: 3, gameType: 'St. George', scores: Array(108).fill(5), date: '2023-01-03' },
        { id: 4, gameType: 'Windsor 40', scores: Array(108).fill(5), date: '2023-01-04' }
      ]
    };

    const result = checkForTheWindsorBronzeAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(4);
    expect(result.targetArrows).toBe(5);
    expect(result.achievingShootId).toBeUndefined();
    expect(result.achievedDate).toBeUndefined();
  });

  it('should only count 9 dozen imperial rounds', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { id: 1, gameType: 'Windsor', scores: Array(108).fill(5), date: '2023-01-01' },
        { id: 2, gameType: 'Windsor 50', scores: Array(108).fill(5), date: '2023-01-02' },
        { id: 3, gameType: 'St. George', scores: Array(108).fill(5), date: '2023-01-03' },
        { id: 4, gameType: 'Windsor 40', scores: Array(108).fill(5), date: '2023-01-04' }
      ]
    };

    const result = checkForTheWindsorBronzeAchieved(context);

    expect(result.totalArrows).toBe(4); // Should count all 4 complete 9 dozen imperial rounds
    expect(result.isUnlocked).toBe(false);
  });

  it('should not count non-nine dozen imperial rounds', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { id: 1, gameType: 'Windsor', scores: Array(108).fill(5), date: '2023-01-01' },
        { id: 2, gameType: 'National', scores: Array(72).fill(5), date: '2023-01-02' }, // 6 dozen
        { id: 3, gameType: 'WA 70m', scores: Array(72).fill(5), date: '2023-01-03' }, // metric
        { id: 4, gameType: 'Windsor 40', scores: Array(108).fill(5), date: '2023-01-04' },
        { id: 5, gameType: 'Windsor 30', scores: Array(108).fill(5), date: '2023-01-05' }
      ]
    };

    const result = checkForTheWindsorBronzeAchieved(context);

    expect(result.totalArrows).toBe(3); // Should only count the Windsor rounds
    expect(result.isUnlocked).toBe(false);
  });
});

describe('checkForTheWindsorSilverAchieved', () => {
  it('should unlock silver achievement when 10 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        gameType: 'Windsor',
        scores: Array(108).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkForTheWindsorSilverAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(10);
    expect(result.targetArrows).toBe(10);
    expect(result.achievingShootId).toBe(10);
    expect(result.achievedDate).toBe('2023-01-10');
  });

  it('should not unlock silver achievement when only 9 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        gameType: 'Windsor',
        scores: Array(108).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkForTheWindsorSilverAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(9);
    expect(result.targetArrows).toBe(10);
  });
});

describe('checkForTheWindsorGoldAchieved', () => {
  it('should unlock gold achievement when 25 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        gameType: 'Windsor',
        scores: Array(108).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkForTheWindsorGoldAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(25);
    expect(result.targetArrows).toBe(25);
    expect(result.achievingShootId).toBe(25);
    expect(result.achievedDate).toBe('2023-01-25');
  });

  it('should not unlock gold achievement when only 24 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        gameType: 'Windsor',
        scores: Array(108).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkForTheWindsorGoldAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(24);
    expect(result.targetArrows).toBe(25);
  });
});

describe('checkForTheWindsorDiamondAchieved', () => {
  it('should unlock diamond achievement when 50 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        gameType: 'Windsor',
        scores: Array(108).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkForTheWindsorDiamondAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(50);
    expect(result.targetArrows).toBe(50);
    expect(result.achievingShootId).toBe(50);
    expect(result.achievedDate).toBe('2023-01-50');
  });

  it('should not unlock diamond achievement when only 49 nine dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 49 }, (_, i) => ({
        id: i + 1,
        gameType: 'Windsor',
        scores: Array(108).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkForTheWindsorDiamondAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(49);
    expect(result.targetArrows).toBe(50);
  });
});

describe('Windsor achievements integration', () => {
  it('should be included in the achievement registry', () => {
    const allAchievements = getAllAchievements();
    const windsorAchievementIds = WINDSOR_ACHIEVEMENTS.map(a => a.id);
    
    windsorAchievementIds.forEach(id => {
      const achievement = allAchievements.find(a => a.id === id);
      expect(achievement).toBeDefined();
      expect(achievement?.name).toContain('For the Windsor');
    });
  });

  it('should have correct achievement properties', () => {
    expect(WINDSOR_ACHIEVEMENTS).toHaveLength(4);
    
    const bronze = WINDSOR_ACHIEVEMENTS.find(a => a.id === 'for_the_windsor_bronze');
    expect(bronze?.tier).toBe('bronze');
    expect(bronze?.targetArrows).toBe(5);
    
    const silver = WINDSOR_ACHIEVEMENTS.find(a => a.id === 'for_the_windsor_silver');
    expect(silver?.tier).toBe('silver');
    expect(silver?.targetArrows).toBe(10);
    
    const gold = WINDSOR_ACHIEVEMENTS.find(a => a.id === 'for_the_windsor_gold');
    expect(gold?.tier).toBe('gold');
    expect(gold?.targetArrows).toBe(25);
    
    const diamond = WINDSOR_ACHIEVEMENTS.find(a => a.id === 'for_the_windsor_diamond');
    expect(diamond?.tier).toBe('diamond');
    expect(diamond?.targetArrows).toBe(50);
  });
});