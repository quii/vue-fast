/**
 * Achievement Store
 * 
 * Manages the state for the single achievement: 10,000 arrows total
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AchievementProgress } from '@/domain/achievements/types.js';
import { check10kArrowsAchieved } from '@/domain/achievements/ten_thousand_arrows.js';
import { TEN_THOUSAND_ARROWS } from '@/domain/achievements/registry.js';

export const useAchievementStore = defineStore('achievement', () => {
  // State
  const progress = ref<AchievementProgress>({
    totalArrows: 0,
    targetArrows: 10000,
    isUnlocked: false
  });

  // Actions
  function updateProgress(currentShoot: any, shootHistory: any[]) {
    const context = {
      currentShoot: { scores: currentShoot.scores || [] },
      shootHistory: shootHistory.map(shoot => ({ scores: shoot.scores || [] }))
    };

    const previousProgress = progress.value;
    progress.value = check10kArrowsAchieved(context);
    
    // Check if achievement was just unlocked
    if (!previousProgress.isUnlocked && progress.value.isUnlocked) {
      return { justUnlocked: true, achievement: TEN_THOUSAND_ARROWS };
    }
    
    return { justUnlocked: false };
  }

  function getAchievementInfo() {
    return TEN_THOUSAND_ARROWS;
  }

  function getProgress() {
    return progress.value;
  }

  return {
    progress,
    updateProgress,
    getAchievementInfo,
    getProgress
  };
});