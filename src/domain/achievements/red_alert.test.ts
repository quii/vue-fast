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
  checkRedAlertAt80ydAchieved,
  RED_ALERT_ACHIEVEMENTS 
} from './red_alert.js';
import type { AchievementContext } from './types.js';

describe('Red Alert Achievement System', () => {
  test('achievements are ordered by distance with imperial first for same distance', () => {
    // Extract distances and units from the achievement IDs
    const achievementOrder = RED_ALERT_ACHIEVEMENTS.map(achievement => {
      const match = achievement.id.match(/red_alert_at_(\d+)(yd|m)/);
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
    
    // Verify we have the expected complete ordering (removed 10yd, 10m, 80m, 100m)
    const expectedOrder = [
      '20yd', '20m', '30yd', '30m', '40yd', '40m', 
      '50yd', '50m', '60yd', '60m', '70m', '80yd', '90m', '100yd'
    ];
    
    const actualOrder = RED_ALERT_ACHIEVEMENTS.map(a => {
      const match = a.id.match(/red_alert_at_(\d+)(yd|m)/);
      return `${match![1]}${match![2]}`;
    });
    
    expect(actualOrder).toEqual(expectedOrder);
  });

  test('tier progression follows distance difficulty correctly', () => {
    // Test that the tier progression makes logical sense (removed 10m distance)
    const bronzeDistances = [20, 30];
    const silverDistances = [40, 50]; 
    const goldDistances = [60, 70];
    const diamondDistances = [90]; // Note: 80yd exists but 80m and 100m don't
    
    // Bronze: easier distances
    bronzeDistances.forEach(distance => {
      const achievement = RED_ALERT_ACHIEVEMENTS.find(a => a.id === `red_alert_at_${distance}m`);
      expect(achievement?.tier).toBe('bronze');
    });
    
    // Silver: medium distances  
    silverDistances.forEach(distance => {
      const achievement = RED_ALERT_ACHIEVEMENTS.find(a => a.id === `red_alert_at_${distance}m`);
      expect(achievement?.tier).toBe('silver');
    });
    
    // Gold: challenging distances
    goldDistances.forEach(distance => {
      const achievement = RED_ALERT_ACHIEVEMENTS.find(a => a.id === `red_alert_at_${distance}m`);
      expect(achievement?.tier).toBe('gold');
    });
    
    // Diamond: hardest distances
    diamondDistances.forEach(distance => {
      const achievement = RED_ALERT_ACHIEVEMENTS.find(a => a.id === `red_alert_at_${distance}m`);
      expect(achievement?.tier).toBe('diamond');
    });
  });

  test('generates achievements for all imperial and metric distances with correct tiers', () => {
    // 7 imperial + 7 metric = 14 total achievements (removed 10yd, 10m, 80m, 100m)
    expect(RED_ALERT_ACHIEVEMENTS).toHaveLength(14);
    
    // Test tier assignments based on distance (removed 10yd, 10m, 80m)
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
        const achievement = RED_ALERT_ACHIEVEMENTS.find(a => a.id === `red_alert_at_${distance}yd`);
        expect(achievement).toBeDefined();
        expect(achievement?.name).toBe(`Red Alert at ${distance}yd`);
        expect(achievement?.tier).toBe(expectedTier);
        expect(achievement?.description).toContain('all 7s');
        expect(achievement?.description).toContain(`${distance}yd`);
      }
    });
    
    // Check metric achievements (available distances: 20, 30, 40, 50, 60, 70, 90)
    Object.entries(expectedTiers).forEach(([distance, expectedTier]) => {
      const metricDistance = parseInt(distance);
      if ([20, 30, 40, 50, 60, 70, 90].includes(metricDistance)) {
        const achievement = RED_ALERT_ACHIEVEMENTS.find(a => a.id === `red_alert_at_${distance}m`);
        expect(achievement).toBeDefined();
        expect(achievement?.name).toBe(`Red Alert at ${distance}m`);
        expect(achievement?.tier).toBe(expectedTier);
        expect(achievement?.description).toContain('all 7s or 8s');
        expect(achievement?.description).toContain(`${distance}m`);
      }
    });
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

  test('checkRedAlertAt80ydAchieved - should NOT unlock with end containing misses (bug reproduction)', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'hereford'
      },
      shootHistory: [{
        id: 'test-shoot',
        date: '2023-01-01',
        gameType: 'hereford', // Imperial round that includes 80yd
        scores: [
          // First end at 80yd - 4 sevens and 2 misses (should NOT be Red Alert)
          7, 7, 7, 7, 'M', 'M',
          // Second end at 80yd - normal scores
          9, 8, 7, 6, 5, 4,
          // Continue with more arrows for a complete Hereford round
          // At 60yd
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3,
          // At 50yd  
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3,
          // At 40yd
          9, 8, 7, 6, 5, 4,
          8, 7, 6, 5, 4, 3
        ],
        score: 195,
        userProfile: { bowType: 'Recurve', gender: 'Men', ageGroup: 'Senior' }
      }]
    };

    const result = checkRedAlertAt80ydAchieved(context);
    
    // This should be false because the end [7,7,7,7,'M','M'] is not all 7s
    expect(result.isUnlocked).toBe(false);
  });

  test('checkRedAlertAt80ydAchieved - ACTUAL BUG: Long Western 80yd scores should NOT unlock', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [],
        gameType: 'long western'
      },
      shootHistory: [{
        id: 'bug-shoot',
        date: '2023-01-01',
        gameType: 'long western', // Long Western: 4 dozen at 80yd, 4 dozen at 60yd
        scores: [
          // 80 yards - 8 ends (48 arrows total) - NONE of these ends are all 7s
          7, 7, 7, 7, 5, 1,  // End 1: 4 sevens but also 5,1 - NOT all 7s
          9, 5, 3, 3, 3, 1,  // End 2: no all-7s
          7, 5, 5, 3, 1, 1,  // End 3: no all-7s
          9, 5, 3, 3, 3, 1,  // End 4: no all-7s
          9, 7, 5, 3, 3, 1,  // End 5: no all-7s
          9, 7, 7, 5, 1, 'M',// End 6: no all-7s
          9, 5, 5, 5, 3, 'M',// End 7: no all-7s
          7, 7, 7, 7, 5, 1,  // End 8: 4 sevens but also 5,1 - NOT all 7s
          
          // 60 yards - 8 ends (48 arrows) 
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

    const result = checkRedAlertAt80ydAchieved(context);
    
    // This should be FALSE because there's no end with all 7s at 80yd
    // The closest ends are [7,7,7,7,5,1] which have 4 sevens but also 5 and 1
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