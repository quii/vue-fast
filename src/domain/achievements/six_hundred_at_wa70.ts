/**
 * 600 at WA70 Achievement Logic
 * 
 * Self-contained logic for determining if the 600+ score on WA 70m achievement has been completed
 */

import type { AchievementContext, AchievementProgress } from './types.js';

export function check600AtWA70Achieved(context: AchievementContext): AchievementProgress {
  const TARGET_SCORE = 600;
  const REQUIRED_GAME_TYPE = 'wa 70m';
  
  // Collect all WA 70m scores (current + historical)
  const allWA70Scores = [];
  
  // Add current shoot if it's WA 70m
  if (context.currentShoot.gameType?.toLowerCase() === REQUIRED_GAME_TYPE && context.currentShoot.score) {
    allWA70Scores.push(context.currentShoot.score);
  }
  
  // Add historical WA 70m shoots
  const wa70Shoots = context.shootHistory.filter(shoot => 
    shoot.gameType?.toLowerCase() === REQUIRED_GAME_TYPE
  );
  
  allWA70Scores.push(...wa70Shoots.map(shoot => shoot.score || 0));
  
  // Find the best score
  const bestScore = allWA70Scores.length > 0 ? Math.max(...allWA70Scores) : 0;
  const hasAchieved = bestScore >= TARGET_SCORE;
  
  return {
    currentScore: bestScore,
    targetScore: TARGET_SCORE,
    isUnlocked: hasAchieved,
    unlockedAt: hasAchieved ? new Date().toISOString() : undefined
  };
}