/**
 * 1k Arrows Achievement Logic
 * 
 * Self-contained logic for determining if the 1k arrows achievement has been completed
 */

import type { AchievementContext, AchievementProgress } from './types.js';
import { checkArrowsAchievement } from './arrows_achievement.js';

export function check1kArrowsAchieved(context: AchievementContext): AchievementProgress {
  return checkArrowsAchievement(context, 1000);
}