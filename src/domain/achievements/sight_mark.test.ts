/**
 * Tests for "Actually, i do have a sight mark" Achievements
 * 
 * Individual achievements: Score over 40 in an end at each imperial distance
 * Distances: 10, 20, 30, 40, 50, 60, 80, 100 yards
 */

import { describe, test, expect } from 'vitest';
import type { AchievementContext, HistoryItem } from './types';
import { 
  checkSightMarkAt10ydAchieved,
  checkSightMarkAt20ydAchieved,
  checkSightMarkAt30ydAchieved,
  checkSightMarkAt40ydAchieved,
  checkSightMarkAt50ydAchieved,
  checkSightMarkAt60ydAchieved,
  checkSightMarkAt80ydAchieved,
  checkSightMarkAt100ydAchieved
} from './sight_mark';

function createMockShoot(date: string, gameType: string, scores: any[], id: number = 1): HistoryItem {
  return {
    id,
    date,
    scores,
    gameType,
    score: scores.reduce((sum, score) => sum + (typeof score === 'number' ? score : 0), 0)
  };
}

function createContext(shoots: HistoryItem[]): AchievementContext {
  return {
    currentShoot: {
      scores: [],
      gameType: 'National'
    },
    shootHistory: shoots
  };
}

describe('Sight mark Achievement - Individual Distances', () => {
  test('not achieved at 20yd with low scoring end', () => {
    // Create a shoot with low scores - total end = 30 < 40
    const shoots = [
      createMockShoot('2024-01-01', 'practice 20yd', [7, 5, 5, 5, 5, 3], 1)
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt20ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('achieved at 20yd with high scoring end', () => {
    // Create a shoot with high scores - total end = 50 > 40
    const shoots = [
      createMockShoot('2024-01-01', 'practice 20yd', [9, 9, 9, 9, 7, 7], 1)
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt20ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBe('2024-01-01');
    expect(progress.achievingShootId).toBe(1);
  });

  test('achieved at 60yd with Windsor round', () => {
    // Windsor includes 60yd - high scoring end achieves it
    const shoots = [
      createMockShoot('2024-02-01', 'windsor', [9, 9, 9, 9, 9, 7], 2) // Total: 52 > 40
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt60ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBe('2024-02-01');
  });

  test('not achieved at 100yd if round does not include that distance', () => {
    // Windsor round does not include 100yd
    const shoots = [
      createMockShoot('2024-01-01', 'windsor', [9, 9, 9, 9, 9, 9], 1)
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt100ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('finds high scoring end among multiple ends', () => {
    // Multiple ends: some low, one high (>40)
    const shoots = [
      createMockShoot('2024-01-01', 'practice 30yd', [
        // End 1: 24 total
        5, 5, 5, 5, 2, 2,
        // End 2: 42 total (>40) - this should trigger achievement  
        9, 7, 7, 7, 7, 5,
        // End 3: 18 total
        3, 3, 3, 3, 3, 3
      ], 1)
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt30ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('handles exactly 40 (not >40)', () => {
    const shoots = [
      createMockShoot('2024-01-01', 'practice 10yd', [7, 7, 7, 7, 6, 6], 1) // Total: exactly 40
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt10ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(false); // Must be >40, not >=40
  });

  test('handles exactly 41 (just >40)', () => {
    const shoots = [
      createMockShoot('2024-01-01', 'practice 10yd', [7, 7, 7, 7, 7, 6], 1) // Total: 41 > 40
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt10ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
  });

  test('handles missing scores (M)', () => {
    const shoots = [
      createMockShoot('2024-01-01', 'practice 50yd', [9, 9, 9, 9, 9, 'M'], 1) // Total: 45 with one miss
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt50ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true); // 45 > 40
  });

  test('different distances are independent achievements', () => {
    // Achievement at 40yd should not affect 80yd achievement
    const shoots = [
      createMockShoot('2024-01-01', 'practice 40yd', [9, 9, 9, 9, 9, 9], 1) // Perfect at 40yd
    ];
    
    const context = createContext(shoots);
    
    // Should achieve 40yd
    const progress40 = checkSightMarkAt40ydAchieved(context);
    expect(progress40.isUnlocked).toBe(true);
    
    // Should NOT achieve 80yd (different distance)
    const progress80 = checkSightMarkAt80ydAchieved(context);
    expect(progress80.isUnlocked).toBe(false);
  });

  test('ignores metric rounds for imperial achievements', () => {
    // Metric round should not contribute to imperial distance achievements
    const shoots = [
      createMockShoot('2024-01-01', 'WA 70m', [10, 10, 10, 10, 10, 10], 1) // Metric round, perfect score
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt60ydAchieved(context); // 60yd is imperial
    
    expect(progress.isUnlocked).toBe(false); // Metric round doesn't count for imperial achievement
  });
});

describe('Sight mark Achievement - Current shoot', () => {
  test('achieved in current shoot', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [9, 9, 9, 9, 7, 7], // Total: 50 > 40
        gameType: 'practice 30yd',
        id: 999,
        date: '2024-03-01'
      },
      shootHistory: []
    };
    
    const progress = checkSightMarkAt30ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.achievingShootId).toBe(999);
  });

  test('not achieved in current shoot with low scores', () => {
    const context: AchievementContext = {
      currentShoot: {
        scores: [5, 5, 5, 5, 5, 5], // Total: 30 < 40
        gameType: 'practice 30yd'
      },
      shootHistory: []
    };
    
    const progress = checkSightMarkAt30ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
  });

  test('returns first qualifying shoot when multiple shoots achieve the same distance', () => {
    // Multiple shoots at same distance - should return the first one found (order will be handled by ensureChronologicalContext)
    const shoots = [
      createMockShoot('2024-01-15', 'practice 20yd', [8, 8, 8, 8, 8, 8], 2), // First in chronological order  
      createMockShoot('2024-02-10', 'practice 20yd', [9, 8, 8, 7, 7, 7], 1), // Second in chronological order
      createMockShoot('2024-03-01', 'practice 20yd', [9, 9, 9, 9, 7, 7], 3), // Third in chronological order
    ];
    
    const context = createContext(shoots);
    const progress = checkSightMarkAt20ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBe('2024-01-15'); // Should be the first qualifying shoot
    expect(progress.achievingShootId).toBe(2); // Should be the first qualifying shoot
    expect(progress.achievedDate).toBe('2024-01-15');
  });

  test('current shoot takes priority over history', () => {
    // Current shoot qualifies - should return current shoot even if history also qualifies
    const context: AchievementContext = {
      currentShoot: {
        scores: [9, 9, 9, 9, 7, 7], // Total: 50 > 40
        gameType: 'practice 30yd',
        id: 999,
        date: '2024-03-01'
      },
      shootHistory: [
        createMockShoot('2024-01-15', 'practice 30yd', [8, 8, 8, 8, 8, 8], 2) // Earlier date but in history
      ]
    };
    
    const progress = checkSightMarkAt30ydAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBe('2024-03-01'); // Should be the current shoot
    expect(progress.achievingShootId).toBe(999); // Should be the current shoot
    expect(progress.achievedDate).toBe('2024-03-01');
  });
});