/**
 * Higher-Order Function for Arrow Count Achievements
 * 
 * Shared logic for achievements based on total arrow count
 */

import type { AchievementContext, AchievementProgress } from './types.js';

export function checkArrowsAchievement(context: AchievementContext, targetArrows: number): AchievementProgress {
  // Count total arrows from all shoots
  const totalArrows = context.shootHistory.reduce((total, shoot) => {
    return total + (Array.isArray(shoot.scores) ? shoot.scores.length : 0);
  }, 0) + (Array.isArray(context.currentShoot.scores) ? context.currentShoot.scores.length : 0);
  
  const isUnlocked = totalArrows >= targetArrows;
  
  return {
    totalArrows,
    targetArrows,
    isUnlocked,
    unlockedAt: isUnlocked ? new Date().toISOString() : undefined
  };
}