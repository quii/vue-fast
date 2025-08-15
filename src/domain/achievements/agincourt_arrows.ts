/**
 * 10k Arrows Achievement Logic
 * 
 * Self-contained logic for determining if the 10k arrows achievement has been completed
 */

import type { AchievementContext, AchievementProgress } from './types.js';
import { checkArrowsAchievement } from './arrows_achievement.js';

export function checkAgincourtArrowsAchieved(context: AchievementContext): AchievementProgress {
  return checkArrowsAchievement(context, 1415);
}