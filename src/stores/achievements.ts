/**
 * Achievement Store
 * 
 * Manages achievement state, notifications, and user preferences
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AchievementContext } from '@/domain/achievements/types.js';
import { calculateAchievements } from '@/domain/achievements/calculator.js';

interface UnreadAchievement {
  id: string;
  name: string;
  description: string;
  tier: string;
  achievingShootId?: number | string;
  achievedDate?: string;
  unlockedAt: string;
}

export const useAchievementStore = defineStore('achievement', () => {
  // State
  const unreadAchievements = ref<UnreadAchievement[]>([]);
  const celebratedAchievements = ref<Set<string>>(new Set()); // Track which achievements we've already shown popups for
  const lastCheckedTimestamp = ref<string | null>(null);
  const popupsEnabled = ref<boolean>(true);

  // Load preferences from localStorage
  function loadPreferences() {
    const stored = localStorage.getItem('achievement-preferences');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        popupsEnabled.value = prefs.popupsEnabled ?? true;
        lastCheckedTimestamp.value = prefs.lastCheckedTimestamp ?? null;
        
        // Load celebrated achievements
        const storedCelebrated = prefs.celebratedAchievements || [];
        celebratedAchievements.value = new Set(storedCelebrated);
        
        // Load unread achievements (but filter out old ones)
        const storedUnread = prefs.unreadAchievements || [];
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        unreadAchievements.value = storedUnread.filter((achievement: UnreadAchievement) => 
          achievement.unlockedAt > oneDayAgo
        );
      } catch (e) {
        console.warn('Failed to load achievement preferences:', e);
      }
    }
  }

  // Save preferences to localStorage
  function savePreferences() {
    const prefs = {
      popupsEnabled: popupsEnabled.value,
      lastCheckedTimestamp: lastCheckedTimestamp.value,
      celebratedAchievements: Array.from(celebratedAchievements.value),
      unreadAchievements: unreadAchievements.value
    };
    localStorage.setItem('achievement-preferences', JSON.stringify(prefs));
  }

  // Computed
  const unreadCount = computed(() => unreadAchievements.value.length);
  const hasUnreadAchievements = computed(() => unreadCount.value > 0);

  // Actions
  function updateAchievements(context: AchievementContext): UnreadAchievement[] {
    const currentAchievements = calculateAchievements(context);
    const currentTime = new Date().toISOString();
    const newlyUnlocked: UnreadAchievement[] = [];

    // Find newly unlocked achievements
    currentAchievements.forEach(achievement => {
      if (achievement.progress.isUnlocked) {
        // Check if this is a new achievement (not already in unread list)
        const alreadyUnread = unreadAchievements.value.some(unread => unread.id === achievement.id);
        
        // Only show popup for achievements we haven't celebrated yet
        const hasBeenCelebrated = celebratedAchievements.value.has(achievement.id);

        if (!alreadyUnread && !hasBeenCelebrated) {
          // Don't mark as celebrated yet - only when actually dismissed
          const newUnread: UnreadAchievement = {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            tier: achievement.tier,
            achievingShootId: achievement.progress.achievingShootId,
            achievedDate: achievement.progress.achievedDate,
            unlockedAt: achievement.progress.unlockedAt || currentTime
          };
          
          newlyUnlocked.push(newUnread);
          unreadAchievements.value.push(newUnread);
        }
      }
    });

    lastCheckedTimestamp.value = currentTime;
    savePreferences();
    
    return newlyUnlocked;
  }

  function markAsRead(achievementId: string) {
    const index = unreadAchievements.value.findIndex(achievement => achievement.id === achievementId);
    if (index !== -1) {
      unreadAchievements.value.splice(index, 1);
      // Mark as celebrated so we don't show popup again for this achievement
      celebratedAchievements.value.add(achievementId);
      savePreferences();
    }
  }

  function markAllAsRead() {
    unreadAchievements.value = [];
    savePreferences();
  }

  function setPopupsEnabled(enabled: boolean) {
    popupsEnabled.value = enabled;
    savePreferences();
  }


  // Initialize preferences
  loadPreferences();

  return {
    // State
    unreadAchievements,
    popupsEnabled,
    
    // Computed
    unreadCount,
    hasUnreadAchievements,
    
    // Actions
    updateAchievements,
    markAsRead,
    markAllAsRead,
    setPopupsEnabled,
    loadPreferences,
    savePreferences
  };
});