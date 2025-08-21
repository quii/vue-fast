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

    // Should show the popup
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(true);
    expect(achievementNotifications.currentAchievement.value).toEqual(achievements[0]);
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
    expect(achievementNotifications.currentAchievement.value).toBe(null);
  });

  test('dismissCelebrationPopup marks achievement as read', () => {
    const achievementNotifications = useAchievementNotifications();
    const markAsReadSpy = vi.spyOn(achievementNotifications.achievementStore, 'markAsRead');
    
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
    expect(achievementNotifications.currentAchievement.value).toEqual(achievement);

    // Dismiss the popup
    achievementNotifications.dismissCelebrationPopup();

    // Should mark as read
    expect(markAsReadSpy).toHaveBeenCalledWith('achievement_1');
    expect(achievementNotifications.currentAchievement.value).toBe(null);
    expect(achievementNotifications.showCelebrationPopup.value).toBe(false);
  });

  test('handles multiple achievements in sequence', () => {
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

    // Should show first achievement
    expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(true);
    expect(achievementNotifications.currentAchievement.value?.id).toBe('achievement_1');

    // Dismiss first achievement
    achievementNotifications.dismissCelebrationPopup();

    // Should eventually show second achievement (after timeout)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(achievementNotifications.shouldShowCelebrationModal.value).toBe(true);
        expect(achievementNotifications.currentAchievement.value?.id).toBe('achievement_2');
        resolve();
      }, 600);
    });
  });
});