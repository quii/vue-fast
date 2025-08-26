/**
 * Achievement service for shoot-specific achievement queries
 */

import type { AchievementData } from './calculator.js';

/**
 * Get achievements that were earned by a specific shoot
 * @param allAchievements - Pre-calculated achievements from centralized service
 * @param shootId - The ID of the shoot to get achievements for
 * @returns Array of achievements earned by this specific shoot, sorted by achieved date (newest first)
 */
export function getAchievementsForShoot(allAchievements: AchievementData[], shootId: number | string) {
  
  // Filter to only achievements earned by this specific shoot
  return allAchievements
    .filter(achievement => 
      achievement.progress.isUnlocked && 
      achievement.progress.achievingShootId === shootId
    )
    .sort((a, b) => {
      const dateA = new Date(a.progress.achievedDate || a.progress.unlockedAt || 0);
      const dateB = new Date(b.progress.achievedDate || b.progress.unlockedAt || 0);
      return dateB - dateA;
    });
}