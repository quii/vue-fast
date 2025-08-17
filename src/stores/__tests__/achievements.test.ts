/**
 * Achievement Store Tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAchievementStore } from '../achievements.js';

describe('Achievement Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  test('initializes with default values', () => {
    const store = useAchievementStore();
    
    expect(store.unreadAchievements).toEqual([]);
    expect(store.popupsEnabled).toBe(true);
    expect(store.unreadCount).toBe(0);
    expect(store.hasUnreadAchievements).toBe(false);
  });

  test('manages unread achievements', () => {
    const store = useAchievementStore();
    
    const context = {
      currentShoot: { 
        id: 'test',
        date: '2023-01-01',
        scores: Array(1000).fill(9),
        gameType: 'practice'
      },
      shootHistory: [
        { 
          id: 1,
          date: '2022-01-01',
          scores: Array(9000).fill(8),
          gameType: 'practice'
        }
      ]
    };
    
    const newAchievements = store.updateAchievements(context);
    
    expect(newAchievements.length).toBeGreaterThan(0);
    expect(store.unreadCount).toBeGreaterThan(0);
    expect(store.hasUnreadAchievements).toBe(true);
  });

  test('marks achievements as read', () => {
    const store = useAchievementStore();
    
    // Manually add an unread achievement
    store.unreadAchievements.push({
      id: 'test_achievement',
      name: 'Test',
      description: 'Test achievement',
      tier: 'bronze',
      unlockedAt: new Date().toISOString()
    });
    
    expect(store.unreadCount).toBe(1);
    
    store.markAsRead('test_achievement');
    
    expect(store.unreadCount).toBe(0);
    expect(store.hasUnreadAchievements).toBe(false);
  });

  test('handles popup preferences', () => {
    const store = useAchievementStore();
    
    expect(store.popupsEnabled).toBe(true);
    
    store.setPopupsEnabled(false);
    
    expect(store.popupsEnabled).toBe(false);
    
    // Check that it persists
    const newStore = useAchievementStore();
    expect(newStore.popupsEnabled).toBe(false);
  });

});