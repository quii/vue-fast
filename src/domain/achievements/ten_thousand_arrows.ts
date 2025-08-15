/**
 * 10k Arrows Achievement Logic
 * 
 * Self-contained logic for determining if the 10k arrows achievement has been completed
 */

import type { AchievementContext, AchievementProgress } from './types.js';

export function check10kArrowsAchieved(context: AchievementContext): AchievementProgress {
  const TARGET_ARROWS = 10000;
  
  // Count total arrows from all shoots
  const totalArrows = context.shootHistory.reduce((total, shoot) => {
    return total + (Array.isArray(shoot.scores) ? shoot.scores.length : 0);
  }, 0) + (Array.isArray(context.currentShoot.scores) ? context.currentShoot.scores.length : 0);
  
  const isUnlocked = totalArrows >= TARGET_ARROWS;
  
  return {
    totalArrows,
    targetArrows: TARGET_ARROWS,
    isUnlocked,
    unlockedAt: isUnlocked ? new Date().toISOString() : undefined
  };
}