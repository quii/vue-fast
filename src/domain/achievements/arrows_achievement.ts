/**
 * Higher-Order Function for Arrow Count Achievements
 * 
 * Shared logic for achievements based on total arrow count
 */

import type { AchievementContext, AchievementProgress } from './types.js';

export function checkArrowsAchievement(context: AchievementContext, targetArrows: number): AchievementProgress {
  let runningTotal = 0;
  let achievingShootId: number | string | undefined;
  let achievedDate: string | undefined;
  
  // Process history shoots in chronological order to find the achieving shoot
  const chronologicalHistory = [...context.shootHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Check each historical shoot
  for (const shoot of chronologicalHistory) {
    const shootArrows = Array.isArray(shoot.scores) ? shoot.scores.length : 0;
    const previousTotal = runningTotal;
    runningTotal += shootArrows;
    
    // If this shoot crosses the threshold, track it
    if (previousTotal < targetArrows && runningTotal >= targetArrows) {
      achievingShootId = shoot.id;
      achievedDate = shoot.date;
      break;
    }
  }
  
  const totalArrows = runningTotal;
  const isUnlocked = totalArrows >= targetArrows;
  
  return {
    totalArrows,
    targetArrows,
    isUnlocked,
    unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
    achievingShootId: isUnlocked ? achievingShootId : undefined,
    achievedDate: isUnlocked ? achievedDate : undefined
  };
}