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
  const currentAchievement = ref(null);
  
  // Queue for multiple achievements
  const achievementQueue = ref<any[]>([]);
  
  // Notification service
  const notificationService = createAchievementNotificationService(
    achievementStore,
    {
      onNewAchievements: (achievements) => {
        // Add achievements to queue
        achievementQueue.value.push(...achievements);
        showNextAchievement();
      }
    }
  );
  
  function showNextAchievement() {
    if (achievementQueue.value.length > 0 && !showCelebrationPopup.value) {
      const nextAchievement = achievementQueue.value.shift();
      currentAchievement.value = nextAchievement;
      showCelebrationPopup.value = true;
    }
  }
  
  function dismissCelebrationPopup() {
    if (currentAchievement.value) {
      achievementStore.markAsRead(currentAchievement.value.id);
    }
    
    showCelebrationPopup.value = false;
    currentAchievement.value = null;
    
    // Show next achievement in queue after a brief delay
    setTimeout(() => {
      showNextAchievement();
    }, 500);
  }
  
  
  function disablePopups() {
    achievementStore.setPopupsEnabled(false);
    
    // Clear any queued achievements
    achievementQueue.value = [];
    
    // Mark any current achievement as read
    if (currentAchievement.value) {
      achievementStore.markAsRead(currentAchievement.value.id);
    }
  }
  
  async function checkAchievements(context: AchievementContext): Promise<boolean> {
    return await notificationService.checkAchievements(context);
  }


  // Computed property to ensure we have valid achievement data before showing modal
  const hasValidCurrentAchievement = computed(() => {
    const achievement = currentAchievement.value;
    const isValid = achievement !== null && 
           achievement !== undefined &&
           typeof achievement === 'object' &&
           typeof achievement.name === 'string' && 
           typeof achievement.description === 'string' &&
           achievement.name.length > 0 &&
           achievement.description.length > 0;
    
    // Debug logging to see what's happening
    if (!isValid && showCelebrationPopup.value) {
      console.warn('Invalid achievement data but popup is showing:', achievement);
    }
    
    return isValid;
  });

  // Computed property that combines both conditions for safety
  const shouldShowCelebrationModal = computed(() => {
    return showCelebrationPopup.value && hasValidCurrentAchievement.value;
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
      // Add achievements to queue and start showing them
      achievementQueue.value.push(...achievements);
      showNextAchievement();
    }
  }

  return {
    // State
    showCelebrationPopup,
    currentAchievement,
    hasValidCurrentAchievement,
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