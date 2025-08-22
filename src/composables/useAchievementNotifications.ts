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
  
  // Queue for batched achievements
  const achievementQueue = ref<any[]>([]);
  
  // Notification service
  const notificationService = createAchievementNotificationService(
    achievementStore,
    {
      onNewAchievements: (achievements) => {
        // Add achievements to queue as a batch
        if (achievements.length > 0) {
          achievementQueue.value.push(achievements);
          showNextAchievementBatch();
        }
      }
    }
  );
  
  function showNextAchievementBatch() {
    console.log('[POPUP DEBUG] showNextAchievementBatch called');
    console.log('[POPUP DEBUG] Queue length:', achievementQueue.value.length);
    console.log('[POPUP DEBUG] showCelebrationPopup.value:', showCelebrationPopup.value);
    
    if (achievementQueue.value.length > 0 && !showCelebrationPopup.value) {
      const nextBatch = achievementQueue.value.shift();
      console.log('[POPUP DEBUG] Setting current achievements batch:', nextBatch);
      currentAchievements.value = nextBatch;
      showCelebrationPopup.value = true;
      console.log('[POPUP DEBUG] Set showCelebrationPopup to true');
    } else {
      console.log('[POPUP DEBUG] Not showing - queue empty or popup already showing');
    }
  }
  
  function dismissCelebrationPopup() {
    showCelebrationPopup.value = false;
    currentAchievements.value = [];
    
    // Show next achievement batch in queue after a brief delay
    setTimeout(() => {
      showNextAchievementBatch();
    }, 500);
  }
  
  
  function disablePopups() {
    achievementStore.setPopupsEnabled(false);
    
    // Clear any queued achievements
    achievementQueue.value = [];
    
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
    console.log('[POPUP DEBUG] showAchievementsForShoot called with', achievements.length, 'achievements');
    console.log('[POPUP DEBUG] popupsEnabled:', achievementStore.popupsEnabled);
    console.log('[POPUP DEBUG] current queue length:', achievementQueue.value.length);
    console.log('[POPUP DEBUG] showCelebrationPopup.value:', showCelebrationPopup.value);
    
    // Temporarily force enable popups for debugging
    if (!achievementStore.popupsEnabled) {
      console.log('[POPUP DEBUG] Popups are disabled - enabling them for debugging');
      achievementStore.setPopupsEnabled(true);
    }
    
    if (achievements.length > 0 && achievementStore.popupsEnabled) {
      console.log('[POPUP DEBUG] Adding achievements batch to queue and showing...');
      // Add achievements as a single batch to queue
      achievementQueue.value.push(achievements);
      console.log('[POPUP DEBUG] Queue length after adding batch:', achievementQueue.value.length);
      showNextAchievementBatch();
    } else {
      console.log('[POPUP DEBUG] Not showing popup - either no achievements or popups disabled');
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