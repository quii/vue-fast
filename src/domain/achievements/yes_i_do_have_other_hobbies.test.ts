/**
 * Tests for "Yes I do have other hobbies" Achievement
 * 
 * Achievement: Record 20 shoots in one calendar month
 */

import { describe, test, expect } from 'vitest';
import type { AchievementContext, HistoryItem } from './types';
import { checkYesIdoHaveOtherHobbiesAchieved } from './yes_i_do_have_other_hobbies';

function createMockShoot(date: string, id: number = 1): HistoryItem {
  return {
    id,
    date,
    scores: [9, 8, 7, 6, 5, 4], // 6 arrows per shoot
    gameType: 'Windsor',
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

describe('Yes I do have other hobbies Achievement', () => {
  test('not achieved with no shoots', () => {
    const context = createContext([]);
    
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(0);
    expect(progress.targetArrows).toBe(20);
  });

  test('not achieved with 19 shoots in one month', () => {
    const shoots: HistoryItem[] = [];
    // Create 19 shoots in January 2024
    for (let day = 1; day <= 19; day++) {
      shoots.push(createMockShoot(`2024-01-${day.toString().padStart(2, '0')}`, day));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(19);
    expect(progress.targetArrows).toBe(20);
  });

  test('achieved with exactly 20 shoots in one month', () => {
    const shoots: HistoryItem[] = [];
    // Create 20 shoots in January 2024
    for (let day = 1; day <= 20; day++) {
      shoots.push(createMockShoot(`2024-01-${day.toString().padStart(2, '0')}`, day));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(20);
    expect(progress.targetArrows).toBe(20);
    expect(progress.unlockedAt).toBe('2024-01-20');
    expect(progress.achievingShootId).toBe(20);
  });

  test('achieved with 25 shoots in one month', () => {
    const shoots: HistoryItem[] = [];
    // Create 25 shoots in February 2024
    for (let day = 1; day <= 25; day++) {
      shoots.push(createMockShoot(`2024-02-${day.toString().padStart(2, '0')}`, day));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(25);
    expect(progress.targetArrows).toBe(20);
    expect(progress.unlockedAt).toBe('2024-02-20');
    expect(progress.achievingShootId).toBe(20);
  });

  test('finds best month when multiple months have shoots', () => {
    const shoots: HistoryItem[] = [];
    
    // January: 15 shoots
    for (let day = 1; day <= 15; day++) {
      shoots.push(createMockShoot(`2024-01-${day.toString().padStart(2, '0')}`, day));
    }
    
    // February: 22 shoots (should be the best)
    for (let day = 1; day <= 22; day++) {
      shoots.push(createMockShoot(`2024-02-${day.toString().padStart(2, '0')}`, day + 100));
    }
    
    // March: 10 shoots
    for (let day = 1; day <= 10; day++) {
      shoots.push(createMockShoot(`2024-03-${day.toString().padStart(2, '0')}`, day + 200));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(22);
    expect(progress.unlockedAt).toBe('2024-02-20');
    expect(progress.achievingShootId).toBe(120); // 20 + 100
  });

  test('handles month boundaries correctly', () => {
    const shoots: HistoryItem[] = [];
    
    // 19 shoots at end of January
    for (let day = 13; day <= 31; day++) {
      shoots.push(createMockShoot(`2024-01-${day}`, day));
    }
    
    // 5 shoots at start of February - should not combine with January
    for (let day = 1; day <= 5; day++) {
      shoots.push(createMockShoot(`2024-02-${day.toString().padStart(2, '0')}`, day + 100));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(19); // Best month is January with 19 shoots
  });

  test('handles leap year February correctly', () => {
    const shoots: HistoryItem[] = [];
    
    // 21 shoots across leap year February (29 days)
    const daysToShoot = [1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 1]; // 21 shoots, last one on March 1st
    
    for (let i = 0; i < 20; i++) {
      const day = daysToShoot[i];
      shoots.push(createMockShoot(`2024-02-${day.toString().padStart(2, '0')}`, i + 1));
    }
    
    // One shoot in March (should not affect February count)
    shoots.push(createMockShoot('2024-03-01', 21));
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(20);
    expect(progress.unlockedAt).toBe('2024-02-29');
    expect(progress.achievingShootId).toBe(20);
  });

  test('handles shoots on same day correctly', () => {
    const shoots: HistoryItem[] = [];
    
    // Multiple shoots on the same days in January
    for (let day = 1; day <= 10; day++) {
      // Two shoots per day for first 10 days = 20 shoots
      shoots.push(createMockShoot(`2024-01-${day.toString().padStart(2, '0')}`, day * 2 - 1));
      shoots.push(createMockShoot(`2024-01-${day.toString().padStart(2, '0')}`, day * 2));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(true);
    expect(progress.totalArrows).toBe(20);
    expect(progress.unlockedAt).toBe('2024-01-10');
    expect(progress.achievingShootId).toBe(20); // The 20th shoot
  });

  test('progress tracking shows best month performance', () => {
    const shoots: HistoryItem[] = [];
    
    // January: 8 shoots
    for (let day = 1; day <= 8; day++) {
      shoots.push(createMockShoot(`2024-01-${day.toString().padStart(2, '0')}`, day));
    }
    
    // February: 15 shoots (best month so far)
    for (let day = 1; day <= 15; day++) {
      shoots.push(createMockShoot(`2024-02-${day.toString().padStart(2, '0')}`, day + 100));
    }
    
    const context = createContext(shoots);
    const progress = checkYesIdoHaveOtherHobbiesAchieved(context);
    
    expect(progress.isUnlocked).toBe(false);
    expect(progress.totalArrows).toBe(15); // Best month performance
    expect(progress.targetArrows).toBe(20);
    expect(progress.unlockedAt).toBeUndefined();
    expect(progress.achievingShootId).toBeUndefined();
  });
});