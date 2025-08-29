/**
 * Don't Be Blue Achievement Tests
 * 
 * Tests for the Don't Be Blue achievement system:
 * - Imperial: all 5s in an end
 * - Metric: all 5s or 6s (or mixed) in an end
 */

import { describe, test, expect } from 'vitest';
import { 
  checkDontBeBlueAt50ydAchieved,
  checkDontBeBlueAt70mAchieved,
  checkDontBeBlueAt80ydAchieved,
  DONT_BE_BLUE_ACHIEVEMENTS 
} from './dont_be_blue.js';
import type { AchievementContext } from './types.js';

describe('Don\'t Be Blue Achievement System', () => {
  test('achievements are ordered by distance with imperial first for same distance', () => {
    // Extract distances and units from the achievement IDs
    const achievementOrder = DONT_BE_BLUE_ACHIEVEMENTS.map(achievement => {
      const match = achievement.id.match(/dont_be_blue_at_(\d+)(yd|m)/);
      if (!match) throw new Error(`Invalid achievement ID: ${achievement.id}`);
      
      return {
        distance: parseInt(match[1]),
        unit: match[2],
        isImperial: match[2] === 'yd'
      };
    });
    
    // Verify they are sorted correctly
    for (let i = 1; i < achievementOrder.length; i++) {
      const current = achievementOrder[i];
      const previous = achievementOrder[i - 1];
      
      // Distance should be ascending
      if (current.distance < previous.distance) {
        throw new Error(`Distance not ascending: ${previous.distance} before ${current.distance}`);
      }
      
      // If same distance, imperial (yd) should come before metric (m)
      if (current.distance === previous.distance) {
        if (previous.isImperial === false && current.isImperial === true) {
          throw new Error(`Same distance ordering wrong: ${previous.unit} should come after ${current.unit}`);
        }
      }
    }
    
    // Verify we have the expected complete ordering (same as Red Alert)
    const expectedOrder = [
      '20yd', '20m', '30yd', '30m', '40yd', '40m', 
      '50yd', '50m', '60yd', '60m', '70m', '80yd', '90m', '100yd'
    ];
    
    const actualOrder = DONT_BE_BLUE_ACHIEVEMENTS.map(a => {
      const match = a.id.match(/dont_be_blue_at_(\d+)(yd|m)/);
      return `${match![1]}${match![2]}`;
    });
    
    expect(actualOrder).toEqual(expectedOrder);
  });

  test('tier progression follows distance difficulty correctly (same as Red Alert)', () => {
    const bronzeDistances = [20, 30];
    const silverDistances = [40, 50]; 
    const goldDistances = [60, 70];
    const diamondDistances = [90];
    
    // Bronze: easier distances
    bronzeDistances.forEach(distance => {
      const achievement = DONT_BE_BLUE_ACHIEVEMENTS.find(a => a.id === `dont_be_blue_at_${distance}m`);
      expect(achievement?.tier).toBe('bronze');
    });
    
    // Silver: medium distances  
    silverDistances.forEach(distance => {
      const achievement = DONT_BE_BLUE_ACHIEVEMENTS.find(a => a.id === `dont_be_blue_at_${distance}m`);
      expect(achievement?.tier).toBe('silver');
    });
    
    // Gold: challenging distances
    goldDistances.forEach(distance => {
      const achievement = DONT_BE_BLUE_ACHIEVEMENTS.find(a => a.id === `dont_be_blue_at_${distance}m`);
      expect(achievement?.tier).toBe('gold');
    });
    
    // Diamond: hardest distances
    diamondDistances.forEach(distance => {
      const achievement = DONT_BE_BLUE_ACHIEVEMENTS.find(a => a.id === `dont_be_blue_at_${distance}m`);
      expect(achievement?.tier).toBe('diamond');
    });
  });

  test('generates achievements for all imperial and metric distances with correct tiers', () => {
    // 7 imperial + 7 metric = 14 total achievements (same structure as Red Alert)
    expect(DONT_BE_BLUE_ACHIEVEMENTS).toHaveLength(14);
    
    // Test tier assignments based on distance
    const expectedTiers = {
      20: 'bronze',   // <= 30
      30: 'bronze',   // <= 30
      40: 'silver',   // <= 50
      50: 'silver',   // <= 50
      60: 'gold',     // <= 70
      70: 'gold',     // <= 70
      80: 'diamond',  // > 70 (only imperial - no 80m)
      90: 'diamond',  // > 70 (only metric - no 90yd)
      100: 'diamond'  // > 70
    };
    
    // Check imperial achievements (available distances: 20, 30, 40, 50, 60, 80, 100)
    Object.entries(expectedTiers).forEach(([distance, expectedTier]) => {
      const imperialDistance = parseInt(distance);
      if ([20, 30, 40, 50, 60, 80, 100].includes(imperialDistance)) {
        const achievement = DONT_BE_BLUE_ACHIEVEMENTS.find(a => a.id === `dont_be_blue_at_${distance}yd`);
        expect(achievement).toBeDefined();
        expect(achievement?.name).toBe(`Don't Be Blue at ${distance}yd`);
        expect(achievement?.tier).toBe(expectedTier);
        expect(achievement?.description).toContain('all 5s');
        expect(achievement?.description).toContain(`${distance}yd`);
      }
    });
    
    // Check metric achievements (available distances: 20, 30, 40, 50, 60, 70, 90)
    Object.entries(expectedTiers).forEach(([distance, expectedTier]) => {
      const metricDistance = parseInt(distance);
      if ([20, 30, 40, 50, 60, 70, 90].includes(metricDistance)) {
        const achievement = DONT_BE_BLUE_ACHIEVEMENTS.find(a => a.id === `dont_be_blue_at_${distance}m`);
        expect(achievement).toBeDefined();
        expect(achievement?.name).toBe(`Don't Be Blue at ${distance}m`);
        expect(achievement?.tier).toBe(expectedTier);
        expect(achievement?.description).toContain('all 5s or 6s');
        expect(achievement?.description).toContain(`${distance}m`);
      }
    });
  });

  test('checkDontBeBlueAt50ydAchieved - achievement with end of all 5s in imperial round', () => {
    const context: AchievementContext = {
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'windsor 50',
        scores: [
          // First end at 50yd - Don't Be Blue end (all 5s)
          5, 5, 5, 5, 5, 5,
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

    const result = checkDontBeBlueAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkDontBeBlueAt50ydAchieved - no achievement with end of mixed scores in imperial round', () => {
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
          // First end at 50yd - mixed scores (not all 5s)
          5, 5, 6, 5, 5, 5,
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

    const result = checkDontBeBlueAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkDontBeBlueAt70mAchieved - achievement with end of all 5s in metric round', () => {
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
          // First end at 70m - Don't Be Blue end (all 5s)
          5, 5, 5, 5, 5, 5,
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

    const result = checkDontBeBlueAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkDontBeBlueAt70mAchieved - achievement with end of all 6s in metric round', () => {
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
          // First end at 70m - Don't Be Blue end (all 6s)
          6, 6, 6, 6, 6, 6,
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

    const result = checkDontBeBlueAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkDontBeBlueAt70mAchieved - achievement with mixed 5s and 6s in metric round', () => {
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
          // First end at 70m - Don't Be Blue end (mixed 5s and 6s)
          5, 6, 5, 6, 5, 6,
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

    const result = checkDontBeBlueAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
    expect(result.achievedDate).toBe('2023-01-01');
  });

  test('checkDontBeBlueAt70mAchieved - no achievement with scores other than 5s/6s in metric round', () => {
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
          // First end at 70m - mixed scores including 7 (not Don't Be Blue)
          5, 6, 5, 7, 5, 6,
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

    const result = checkDontBeBlueAt70mAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkDontBeBlueAt50ydAchieved - no achievement when distance not in round', () => {
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
          5, 5, 5, 5, 5, 5, // These are at 70m, not 50yd
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

    const result = checkDontBeBlueAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
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

    const result = checkDontBeBlueAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('handles missing game type gracefully', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [5, 5, 5, 5, 5, 5],
        gameType: undefined
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: undefined,
        scores: [5, 5, 5, 5, 5, 5],
        score: 30,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkDontBeBlueAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(false);
  });

  test('checkDontBeBlueAt80ydAchieved - should NOT unlock with end containing misses', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'long western'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'long western',
        scores: [
          // First end at 80yd - 4 fives and 2 misses (should NOT be Don't Be Blue)
          5, 5, 5, 5, 'M', 'M',
          // Second end at 80yd - normal scores
          9, 8, 7, 6, 5, 4,
          // 60 yards
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3,
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 400,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkDontBeBlueAt80ydAchieved(context);
    
    // This should be false because the end [5,5,5,5,'M','M'] is not all 5s
    expect(result.isUnlocked).toBe(false);
  });

  test('checkDontBeBlueAt50ydAchieved - handles M and X scores correctly', () => {
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
          // First end at 50yd - contains M and X, not Don't Be Blue (M=0, X=10, both not 5)
          5, 5, 'M', 5, 'X', 5,
          // Second end at 50yd - Don't Be Blue end (all 5s)
          5, 5, 5, 5, 5, 5,
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

    const result = checkDontBeBlueAt50ydAchieved(context);
    
    expect(result.isUnlocked).toBe(true);
    expect(result.unlockedAt).toBe('2023-01-01');
    expect(result.achievingShootId).toBe('test-shoot');
  });
});