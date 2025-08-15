/**
 * Achievement Store Tests
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAchievementStore } from '../achievements.js';

describe('Achievement Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('initializes with default progress', () => {
    const store = useAchievementStore();
    
    expect(store.progress.totalArrows).toBe(0);
    expect(store.progress.targetArrows).toBe(10000);
    expect(store.progress.isUnlocked).toBe(false);
  });

  test('gets achievement info correctly', () => {
    const store = useAchievementStore();
    
    const info = store.getAchievementInfo();
    
    expect(info.id).toBe('ten_thousand_arrows');
    expect(info.name).toBe('10k Club');
    expect(info.description).toBe('Shoot 10,000 arrows in total');
    expect(info.targetArrows).toBe(10000);
  });

  test('updates progress based on shoot data', () => {
    const store = useAchievementStore();
    
    const currentShoot = { scores: [9, 8, 7, 9, 8, 7] }; // 6 arrows
    const shootHistory = [
      { scores: [8, 7, 6, 8, 7, 6] }, // 6 arrows
      { scores: [7, 6, 5] } // 3 arrows
    ];
    
    const result = store.updateProgress(currentShoot, shootHistory);
    
    expect(store.progress.totalArrows).toBe(15); // 6 + 6 + 3
    expect(store.progress.isUnlocked).toBe(false);
    expect(result.justUnlocked).toBe(false);
  });

  test('marks achievement as unlocked when target reached', () => {
    const store = useAchievementStore();
    
    const currentShoot = { scores: Array(1000).fill(9) }; // 1000 arrows
    const shootHistory = [
      { scores: Array(9000).fill(8) } // 9000 arrows
    ];
    
    const result = store.updateProgress(currentShoot, shootHistory);
    
    expect(store.progress.totalArrows).toBe(10000);
    expect(store.progress.isUnlocked).toBe(true);
    expect(store.progress.unlockedAt).toBeDefined();
    expect(result.justUnlocked).toBe(true);
    expect(result.achievement.name).toBe('10k Club');
  });

  test('handles empty scores arrays', () => {
    const store = useAchievementStore();
    
    const currentShoot = { scores: [] };
    const shootHistory = [
      { scores: [] },
      { scores: [9, 8, 7] }
    ];
    
    const result = store.updateProgress(currentShoot, shootHistory);
    
    expect(store.progress.totalArrows).toBe(3);
    expect(store.progress.isUnlocked).toBe(false);
    expect(result.justUnlocked).toBe(false);
  });
});