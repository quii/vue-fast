/**
 * 25k Arrows Achievement Logic
 * 
 * Self-contained logic for determining if the 25k arrows achievement has been completed
 */

import type { AchievementContext, AchievementProgress } from './types.js';
import { checkArrowsAchievement } from './arrows_achievement.js';

export function check25kArrowsAchieved(context: AchievementContext): AchievementProgress {
  return checkArrowsAchievement(context, 25000);
}