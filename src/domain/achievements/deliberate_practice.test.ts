/**
 * Tests for "Deliberate practice" Achievement
 * 
 * Achievement: Shoot the same round, 3 times in one week (any 7 consecutive days)
 */

import { describe, test, expect } from 'vitest';
import type { AchievementContext, HistoryItem } from './types';
import { checkDeliberatePracticeAchieved } from './deliberate_practice';

function createMockShoot(date: string, gameType: string, id: number = 1): HistoryItem {
  return {
    id,
    date,
    scores: [9, 8, 7, 6, 5, 4], // 6 arrows per shoot
    gameType,
    score: 39
  };
}

function createContext(shoots: HistoryItem[]): AchievementContext {
  return {
    currentShoot: {
      scores: [],
      gameType: 'Windsor'
    },
    shootHistory: shoots
  };
}

describe('Deliberate practice Achievement', () => {
  test('not achieved with no shoots', () => {
    const context = createContext([]);
    
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(0);
    expect(progress.targetArrows).toBe(3);
  });

  test('not achieved with 2 shoots of same round in one week', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-03', 'Windsor', 2)
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(2);
    expect(progress.targetArrows).toBe(3);
  });

  test('achieved with exactly 3 shoots of same round in 7 days', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-03', 'Windsor', 2),
      createMockShoot('2024-01-07', 'Windsor', 3) // 7th day - still within 7-day window
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(3);
    expect(progress.targetArrows).toBe(3);
    expect(progress.unlockedAt).toBe('2024-01-07');
    expect(progress.achievingShootId).toBe(3);
  });

  test('achieved with 4 shoots of same round in one week', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-02-01', 'National', 1),
      createMockShoot('2024-02-02', 'National', 2),
      createMockShoot('2024-02-04', 'National', 3),
      createMockShoot('2024-02-06', 'National', 4) // 4 shoots within 6 days
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(4);
    expect(progress.unlockedAt).toBe('2024-02-04'); // 3rd shoot achieved it
    expect(progress.achievingShootId).toBe(3);
  });

  test('not achieved with 3 shoots spread over 8 days', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-04', 'Windsor', 2),
      createMockShoot('2024-01-09', 'Windsor', 3) // 9th day - outside 7-day window
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(2); // Best 7-day window only has 2 shoots
  });

  test('achieved with mixed round types - finds the qualifying round', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-02', 'National', 2),
      createMockShoot('2024-01-03', 'Windsor', 3),
      createMockShoot('2024-01-04', 'National', 4),
      createMockShoot('2024-01-05', 'Windsor', 5), // 3rd Windsor within 5 days
      createMockShoot('2024-01-06', 'National', 6)  // 3rd National within 6 days
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(3);
    // Should achieve on the 3rd Windsor (whichever comes first chronologically)
    expect(progress.unlockedAt).toBe('2024-01-05');
    expect(progress.achievingShootId).toBe(5);
  });

  test('uses sliding window - finds achievement in later period', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-02', 'Windsor', 2),
      // Gap of 8 days - these first 2 won't work with the 3rd
      createMockShoot('2024-01-11', 'Windsor', 3),
      createMockShoot('2024-01-13', 'Windsor', 4),
      createMockShoot('2024-01-17', 'Windsor', 5) // 3 shoots from 11th-17th (7 days)
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.unlockedAt).toBe('2024-01-17'); // 3rd shoot in the qualifying window
    expect(progress.achievingShootId).toBe(5);
  });

  test('handles multiple shoots on same day correctly', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-01', 'Windsor', 2), // Same day, same round
      createMockShoot('2024-01-03', 'Windsor', 3)  // 3rd shoot within 3 days
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(3);
    expect(progress.unlockedAt).toBe('2024-01-03');
    expect(progress.achievingShootId).toBe(3);
  });

  test('case insensitive round type matching', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'windsor', 1), // lowercase
      createMockShoot('2024-01-02', 'Windsor', 2), // titlecase
      createMockShoot('2024-01-03', 'WINDSOR', 3)  // uppercase
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(3);
  });

  test('boundary case - exactly 7 days apart', () => {
    const shoots: HistoryItem[] = [
      createMockShoot('2024-01-01', 'National', 1), // Day 1
      createMockShoot('2024-01-04', 'National', 2), // Day 4  
      createMockShoot('2024-01-08', 'National', 3)  // Day 8 - outside 7-day window from day 1
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(2); // Best window has only 2 shoots
  });

  test('progress tracking shows best round performance', () => {
    const shoots: HistoryItem[] = [
      // Windsor: 2 shoots in 7 days
      createMockShoot('2024-01-01', 'Windsor', 1),
      createMockShoot('2024-01-05', 'Windsor', 2),
      
      // National: 1 shoot
      createMockShoot('2024-01-10', 'National', 3)
    ];
    
    const context = createContext(shoots);
    const progress = checkDeliberatePracticeAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(2); // Best round type performance
    expect(progress.targetArrows).toBe(3);
  });
});