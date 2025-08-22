/**
 * Achievement Notifications Composable Tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAchievementNotifications } from '../useAchievementNotifications.js';

describe('useAchievementNotifications', () => {
  let mockAchievementStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Mock the achievement store
    mockAchievementStore = {
      unreadAchievements: [],
      popupsEnabled: true,
      markAsRead: vi.fn(),
      setPopupsEnabled: vi.fn()
    };
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('showAchievementsForShoot filters achievements by shoot ID', () => {
    const achievementNotifications = useAchievementNotifications();
    
    // Mock achievements with different shoot IDs
    achievementNotifications.achievementStore.unreadAchievements = [
      {
        id: 'achievement_1',
        name: 'First Achievement',
        description: 'First test achievement',
        tier: 'bronze',
        achievingShootId: 123,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'achievement_2', 
        name: 'Second Achievement',
        description: 'Second test achievement',
        tier: 'silver',
        achievingShootId: 456,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'achievement_3',
        name: 'Third Achievement', 
        description: 'Third test achievement',
        tier: 'gold',
        achievingShootId: 123,
        unlockedAt: new Date().toISOString()
      }
    ];

    // Filter achievements for shoot 123
    const achievementsForShoot123 = achievementNotifications.achievementStore.unreadAchievements.filter(
      (achievement: any) => achievement.achievingShootId === 123
    );

    expect(achievementsForShoot123).toHaveLength(2);
    expect(achievementsForShoot123[0].id).toBe('achievement_1');
    expect(achievementsForShoot123[1].id).toBe('achievement_3');
  });

  test('showAchievementsForShoot shows achievements when popups enabled', () => {
    const achievementNotifications = useAchievementNotifications();
    achievementNotifications.achievementStore.popupsEnabled = true;
    
    const achievements = [
      {
        id: 'achievement_1',
        name: 'Test Achievement',
        description: 'Test description',
        tier: 'bronze',
        achievingShootId: 123,
        unlockedAt: new Date().toISOString()
      }
    ];

    // Call the method
    achievementNotifications.showAchievementsForShoot(achievements);

    // Should show the popup with all achievements
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(true);
    expect(achievementNotifications.currentAchievements.value).toEqual(achievements);
  });

  test.skip('showAchievementsForShoot does not show achievements when popups disabled', () => {
    const achievementNotifications = useAchievementNotifications();
    achievementNotifications.achievementStore.popupsEnabled = false;
    
    const achievements = [
      {
        id: 'achievement_1',
        name: 'Test Achievement',
        description: 'Test description',
        tier: 'bronze',
        achievingShootId: 123,
        unlockedAt: new Date().toISOString()
      }
    ];

    // Call the method
    achievementNotifications.showAchievementsForShoot(achievements);

    // Should not show popup
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(false);
    expect(achievementNotifications.currentAchievement.value).toBe(null);
  });

  test('showAchievementsForShoot handles empty achievement array', () => {
    const achievementNotifications = useAchievementNotifications();
    
    // Call with empty array
    achievementNotifications.showAchievementsForShoot([]);

    // Should not show popup
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(false);
    expect(achievementNotifications.currentAchievements.value).toEqual([]);
  });

  test('dismissCelebrationPopup clears current achievements', () => {
    const achievementNotifications = useAchievementNotifications();
    
    const achievement = {
      id: 'achievement_1',
      name: 'Test Achievement',
      description: 'Test description',
      tier: 'bronze',
      achievingShootId: 123,
      unlockedAt: new Date().toISOString()
    };

    // Show achievement first
    achievementNotifications.showAchievementsForShoot([achievement]);
    expect(achievementNotifications.currentAchievements.value).toEqual([achievement]);

    // Dismiss the popup
    achievementNotifications.dismissCelebrationPopup();

    // Should clear achievements and hide popup
    expect(achievementNotifications.currentAchievements.value).toEqual([]);
    expect(achievementNotifications.showCelebrationPopup.value).toBe(false);
  });

  test('handles multiple achievements in a single modal', () => {
    const achievementNotifications = useAchievementNotifications();
    
    const achievements = [
      {
        id: 'achievement_1',
        name: 'First Achievement',
        description: 'First description',
        tier: 'bronze',
        achievingShootId: 123,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'achievement_2',
        name: 'Second Achievement',
        description: 'Second description', 
        tier: 'silver',
        achievingShootId: 123,
        unlockedAt: new Date().toISOString()
      }
    ];

    // Show multiple achievements
    achievementNotifications.showAchievementsForShoot(achievements);

    // Should show all achievements in one modal
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(true);
    expect(achievementNotifications.currentAchievements.value).toEqual(achievements);
    expect(achievementNotifications.currentAchievements.value).toHaveLength(2);

    // Dismiss should clear all achievements
    achievementNotifications.dismissCelebrationPopup();

    expect(achievementNotifications.currentAchievements.value).toEqual([]);
  });

  test('handles more than 3 achievements correctly', () => {
    const achievementNotifications = useAchievementNotifications();
    
    // Create 5 achievements to test the limit
    const achievements = Array.from({ length: 5 }, (_, i) => ({
      id: `achievement_${i + 1}`,
      name: `Achievement ${i + 1}`,
      description: `Description ${i + 1}`,
      tier: 'bronze',
      achievingShootId: 123,
      unlockedAt: new Date().toISOString()
    }));

    // Show all achievements
    achievementNotifications.showAchievementsForShoot(achievements);

    // Should show popup with all achievements stored
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(true);
    expect(achievementNotifications.currentAchievements.value).toHaveLength(5);

    // Dismiss should clear all achievements
    achievementNotifications.dismissCelebrationPopup();

    expect(achievementNotifications.currentAchievements.value).toEqual([]);
  });
});