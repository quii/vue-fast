/**
 * Achievement Notification Service
 * 
 * Listens for PlayerHistory events and manages achievement notifications
 */

import type { AchievementContext } from './types.js';
import type { HistoryItem } from '@/domain/repositories/player_history.js';

export interface AchievementNotificationService {
  initialize(): void;
  destroy(): void;
  checkAchievements(context: AchievementContext): Promise<boolean>;
}

export interface NotificationCallbacks {
  onNewAchievements: (achievements: any[]) => void;
}

export function createAchievementNotificationService(
  achievementStore: any,
  callbacks: NotificationCallbacks
): AchievementNotificationService {
  
  let isInitialized = false;
  
  function handleArcheryDataChanged(event: CustomEvent) {
    const { type } = event.detail;
    
    // Only respond to data changes that could affect achievements
    if (['score-saved', 'score-deleted', 'history-imported', 'shoot-updated'].includes(type)) {
      // We need to get the current context from somewhere
      // This will be called from the component that has access to history
      console.log(`Achievement service: ${type} event received`);
    }
  }
  
  async function checkAchievements(context: AchievementContext): Promise<boolean> {
    try {
      // Check for newly unlocked achievements
      const newAchievements = achievementStore.updateAchievements(context);
      
      // Only show popups if user hasn't disabled them
      if (newAchievements.length > 0 && achievementStore.popupsEnabled) {
        callbacks.onNewAchievements(newAchievements);
        return true; // Achievements were found and popups will be shown
      }
      
      return false; // Either no achievements or popups disabled - no modal will show
    } catch (error) {
      console.error('Error checking achievements:', error);
      return false;
    }
  }

  
  function initialize() {
    if (isInitialized) return;
    
    window.addEventListener('archery-data-changed', handleArcheryDataChanged);
    isInitialized = true;
  }
  
  function destroy() {
    if (!isInitialized) return;
    
    window.removeEventListener('archery-data-changed', handleArcheryDataChanged);
    isInitialized = false;
  }
  
  return {
    initialize,
    destroy,
    checkAchievements
  };
}