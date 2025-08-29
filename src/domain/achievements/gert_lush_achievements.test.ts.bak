/**
 * Tests for Gert Lush Achievement Group
 */

import { describe, it, expect } from 'vitest';
import { 
  isTwelveDozensImperialRound,
  checkGertLushBronzeAchieved,
  checkGertLushSilverAchieved,
  checkGertLushGoldAchieved,
  checkGertLushDiamondAchieved,
  GERT_LUSH_ACHIEVEMENTS
} from './gert_lush_achievements.js';
import type { AchievementContext } from './types.js';
import { getAllAchievements } from './registry.js';

describe('isTwelveDozensImperialRound', () => {
  it('should identify York as a 12 dozen imperial round', () => {
    expect(isTwelveDozensImperialRound('York')).toBe(true);
  });

  it('should identify Hereford / Bristol I as a 12 dozen imperial round', () => {
    expect(isTwelveDozensImperialRound('Hereford / Bristol I')).toBe(true);
  });

  it('should identify Bristol II as a 12 dozen imperial round', () => {
    expect(isTwelveDozensImperialRound('Bristol II')).toBe(true);
  });

  it('should identify Bristol III as a 12 dozen imperial round', () => {
    expect(isTwelveDozensImperialRound('Bristol III')).toBe(true);
  });

  it('should identify Bristol IV as a 12 dozen imperial round', () => {
    expect(isTwelveDozensImperialRound('Bristol IV')).toBe(true);
  });

  it('should identify Bristol V as a 12 dozen imperial round', () => {
    expect(isTwelveDozensImperialRound('Bristol V')).toBe(true);
  });

  it('should reject National as not 12 dozen (6 dozen total)', () => {
    expect(isTwelveDozensImperialRound('National')).toBe(false);
  });

  it('should reject Windsor as not 12 dozen (9 dozen total)', () => {
    expect(isTwelveDozensImperialRound('Windsor')).toBe(false);
  });

  it('should reject WA 70m as not imperial', () => {
    expect(isTwelveDozensImperialRound('WA 70m')).toBe(false);
  });

  it('should return false for non-existent round', () => {
    expect(isTwelveDozensImperialRound('Non-existent Round')).toBe(false);
  });
});

describe('checkGertLushBronzeAchieved', () => {
  it('should unlock bronze achievement when 1 twelve dozen imperial round completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { id: 1, gameType: 'York', scores: Array(144).fill(5), date: '2023-01-01' }
      ]
    };

    const result = checkGertLushBronzeAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(1);
    expect(result.targetArrows).toBe(1);
    expect(result.achievingShootId).toBe(1);
    expect(result.achievedDate).toBe('2023-01-01');
  });

  it('should not unlock bronze achievement when no twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: []
    };

    const result = checkGertLushBronzeAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(0);
    expect(result.targetArrows).toBe(1);
    expect(result.achievingShootId).toBeUndefined();
    expect(result.achievedDate).toBeUndefined();
  });

  it('should only count 12 dozen imperial rounds', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: [
        { id: 1, gameType: 'York', scores: Array(144).fill(5), date: '2023-01-01' },
        { id: 2, gameType: 'National', scores: Array(72).fill(5), date: '2023-01-02' }, // 6 dozen
        { id: 3, gameType: 'WA 70m', scores: Array(72).fill(5), date: '2023-01-03' }, // metric
        { id: 4, gameType: 'Windsor', scores: Array(108).fill(5), date: '2023-01-04' } // 9 dozen
      ]
    };

    const result = checkGertLushBronzeAchieved(context);

    expect(result.totalArrows).toBe(1); // Should only count York
    expect(result.isUnlocked).toBe(true); // Bronze only needs 1
  });
});

describe('checkGertLushSilverAchieved', () => {
  it('should unlock silver achievement when 5 twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        gameType: 'York',
        scores: Array(144).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkGertLushSilverAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(5);
    expect(result.targetArrows).toBe(5);
    expect(result.achievingShootId).toBe(5);
    expect(result.achievedDate).toBe('2023-01-05');
  });

  it('should not unlock silver achievement when only 4 twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        gameType: 'York',
        scores: Array(144).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkGertLushSilverAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(4);
    expect(result.targetArrows).toBe(5);
  });
});

describe('checkGertLushGoldAchieved', () => {
  it('should unlock gold achievement when 25 twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        gameType: 'York',
        scores: Array(144).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkGertLushGoldAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(25);
    expect(result.targetArrows).toBe(25);
    expect(result.achievingShootId).toBe(25);
    expect(result.achievedDate).toBe('2023-01-25');
  });

  it('should not unlock gold achievement when only 24 twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        gameType: 'York',
        scores: Array(144).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkGertLushGoldAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(24);
    expect(result.targetArrows).toBe(25);
  });
});

describe('checkGertLushDiamondAchieved', () => {
  it('should unlock diamond achievement when 50 twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        gameType: 'York',
        scores: Array(144).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkGertLushDiamondAchieved(context);

    expect(result.isUnlocked).toBe(true);
    expect(result.totalArrows).toBe(50);
    expect(result.targetArrows).toBe(50);
    expect(result.achievingShootId).toBe(50);
    expect(result.achievedDate).toBe('2023-01-50');
  });

  it('should not unlock diamond achievement when only 49 twelve dozen imperial rounds completed', () => {
    const context: AchievementContext = {
      currentShoot: { scores: [] },
      shootHistory: Array.from({ length: 49 }, (_, i) => ({
        id: i + 1,
        gameType: 'York',
        scores: Array(144).fill(5),
        date: `2023-01-${String(i + 1).padStart(2, '0')}`
      }))
    };

    const result = checkGertLushDiamondAchieved(context);

    expect(result.isUnlocked).toBe(false);
    expect(result.totalArrows).toBe(49);
    expect(result.targetArrows).toBe(50);
  });
});

describe('Gert Lush achievements integration', () => {
  it('should be included in the achievement registry', () => {
    const allAchievements = getAllAchievements();
    const gertLushAchievementIds = GERT_LUSH_ACHIEVEMENTS.map(a => a.id);
    
    gertLushAchievementIds.forEach(id => {
      const achievement = allAchievements.find(a => a.id === id);
      expect(achievement).toBeDefined();
      expect(achievement?.name).toContain('Gert Lush');
    });
  });

  it('should have correct achievement properties', () => {
    expect(GERT_LUSH_ACHIEVEMENTS).toHaveLength(4);
    
    const bronze = GERT_LUSH_ACHIEVEMENTS.find(a => a.id === 'gert_lush_bronze');
    expect(bronze?.tier).toBe('bronze');
    expect(bronze?.targetArrows).toBe(1);
    
    const silver = GERT_LUSH_ACHIEVEMENTS.find(a => a.id === 'gert_lush_silver');
    expect(silver?.tier).toBe('silver');
    expect(silver?.targetArrows).toBe(5);
    
    const gold = GERT_LUSH_ACHIEVEMENTS.find(a => a.id === 'gert_lush_gold');
    expect(gold?.tier).toBe('gold');
    expect(gold?.targetArrows).toBe(25);
    
    const diamond = GERT_LUSH_ACHIEVEMENTS.find(a => a.id === 'gert_lush_diamond');
    expect(diamond?.tier).toBe('diamond');
    expect(diamond?.targetArrows).toBe(50);
  });
});