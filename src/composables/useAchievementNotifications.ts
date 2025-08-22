/**
 * Achievement Notifications Composable
 * 
 * Manages achievement notification popups and celebration flow
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAchievementStore } from '@/stores/achievements.js';
import { createAchievementNotificationService } from '@/domain/achievements/notification_service.js';
import type { AchievementContext } from '@/domain/achievements/types.js';

export function useAchievementNotifications() {
  const achievementStore = useAchievementStore();
  
  // State for popups
  const showCelebrationPopup = ref(false);
  const currentAchievements = ref<any[]>([]);
  
  // Notification service
  const notificationService = createAchievementNotificationService(
    achievementStore,
    {
      onNewAchievements: (achievements) => {
        // Show achievements immediately if popups are enabled
        if (achievements.length > 0 && achievementStore.popupsEnabled) {
          currentAchievements.value = achievements;
          showCelebrationPopup.value = true;
        }
      }
    }
  );
  
  function dismissCelebrationPopup() {
    showCelebrationPopup.value = false;
    currentAchievements.value = [];
  }
  
  function disablePopups() {
    achievementStore.setPopupsEnabled(false);
    // Clear current achievements
    currentAchievements.value = [];
  }
  
  async function checkAchievements(context: AchievementContext): Promise<boolean> {
    return await notificationService.checkAchievements(context);
  }


  // Computed property to ensure we have valid achievement data before showing modal
  const hasValidCurrentAchievements = computed(() => {
    const achievements = currentAchievements.value;
    if (!Array.isArray(achievements) || achievements.length === 0) {
      return false;
    }
    
    const allValid = achievements.every(achievement => {
      return achievement !== null && 
             achievement !== undefined &&
             typeof achievement === 'object' &&
             typeof achievement.name === 'string' && 
             achievement.name.length > 0 &&
             // Description is optional - if present, it should be a string, but can be empty/undefined
             (achievement.description === undefined || 
              achievement.description === null || 
              typeof achievement.description === 'string');
    });
    
    // Debug logging to see what's happening
    if (!allValid && showCelebrationPopup.value) {
      console.warn('Invalid achievement data but popup is showing:', achievements);
    }
    
    return allValid;
  });

  // Computed property that combines both conditions for safety
  const shouldShowCelebrationModal = computed(() => {
    return showCelebrationPopup.value && hasValidCurrentAchievements.value;
  });
  
  // Lifecycle
  onMounted(() => {
    notificationService.initialize();
  });
  
  onUnmounted(() => {
    notificationService.destroy();
  });
  
  // Method to show specific achievements without full calculation
  function showAchievementsForShoot(achievements: any[]) {
    if (achievements.length > 0 && achievementStore.popupsEnabled) {
      currentAchievements.value = achievements;
      showCelebrationPopup.value = true;
    }
  }

  return {
    // State
    showCelebrationPopup,
    currentAchievements,
    hasValidCurrentAchievements,
    shouldShowCelebrationModal,
    
    // Actions
    checkAchievements,
    dismissCelebrationPopup,
    disablePopups,
    showAchievementsForShoot,
    
    // Store access
    achievementStore
  };
}