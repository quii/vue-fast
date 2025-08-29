/**
 * Frostbite Achievement System
 * 
 * Awards for achieving specific scores on Frostbite rounds
 * Only available on Frostbite shoots
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { FROSTBITE_GROUP } from './groups.js';

// Score thresholds for each tier
const FROSTBITE_THRESHOLDS = [
  { score: 200, tier: 'bronze' as const },
  { score: 225, tier: 'bronze' as const },
  { score: 250, tier: 'bronze' as const },
  { score: 275, tier: 'silver' as const },
  { score: 300, tier: 'silver' as const },
  { score: 315, tier: 'gold' as const },
  { score: 325, tier: 'gold' as const },
  { score: 330, tier: 'gold' as const },
  { score: 340, tier: 'diamond' as const },
  { score: 350, tier: 'diamond' as const },
  { score: 355, tier: 'diamond' as const }
] as const;

/**
 * Higher-order function to create a Frostbite achievement for a specific score
 */
function createFrostbiteAchievement(threshold: typeof FROSTBITE_THRESHOLDS[number]): Achievement {
  return {
    id: `frostbite_${threshold.score}`,
    name: `Frostbite ${threshold.score}`,
    tier: threshold.tier,
    targetScore: threshold.score,
    gameType: 'frostbite',
    group: FROSTBITE_GROUP
  };
}

/**
 * Generate all Frostbite achievements
 */
export const FROSTBITE_ACHIEVEMENTS: Achievement[] = FROSTBITE_THRESHOLDS.map(createFrostbiteAchievement);

/**
 * Higher-order function to create the achievement check function for a specific score
 */
function createFrostbiteCheckFunction(targetScore: number) {
  return function checkFrostbiteAchieved(context: AchievementContext): AchievementProgress {
    const requiredGameType = 'frostbite';
    
    // Check if we've already achieved this in history
    const existingAchievement = findExistingFrostbiteAchievement(context, targetScore, requiredGameType);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check historical shoots
    const historicalProgress = checkFrostbiteInHistory(context, targetScore, requiredGameType);
    if (historicalProgress.isUnlocked) {
      return historicalProgress;
    }

    // Not achieved yet - return current best attempt
    return {
      currentScore: Math.max(historicalProgress.currentScore || 0),
      targetScore: targetScore,
      isUnlocked: false
    };
  };
}

/**
 * Check for existing Frostbite achievement in history
 */
function findExistingFrostbiteAchievement(
  context: AchievementContext, 
  targetScore: number, 
  requiredGameType: string
): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType?.toLowerCase() === requiredGameType && 
        (historyItem.score || 0) >= targetScore) {
      return {
        currentScore: historyItem.score || 0,
        targetScore: targetScore,
        isUnlocked: true,
        unlockedAt: historyItem.date,
        achievingShootId: historyItem.id,
        achievedDate: historyItem.date
      };
    }
  }
  return null;
}

/**
 * Check history for best Frostbite attempt
 */
function checkFrostbiteInHistory(
  context: AchievementContext, 
  targetScore: number, 
  requiredGameType: string
): AchievementProgress {
  let bestScore = 0;
  let unlockedAt: string | undefined;
  let achievingShootId: number | string | undefined;
  let achievedDate: string | undefined;

  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType?.toLowerCase() === requiredGameType) {
      const score = historyItem.score || 0;
      if (score > bestScore) {
        bestScore = score;
        if (score >= targetScore) {
          unlockedAt = historyItem.date;
          achievingShootId = historyItem.id;
          achievedDate = historyItem.date;
        }
      }
    }
  }

  return {
    currentScore: bestScore,
    targetScore: targetScore,
    isUnlocked: bestScore >= targetScore,
    unlockedAt: unlockedAt,
    achievingShootId: achievingShootId,
    achievedDate: achievedDate
  };
}

/**
 * Export individual check functions for each score threshold
 */
export const checkFrostbite200Achieved = createFrostbiteCheckFunction(200);
export const checkFrostbite225Achieved = createFrostbiteCheckFunction(225);
export const checkFrostbite250Achieved = createFrostbiteCheckFunction(250);
export const checkFrostbite275Achieved = createFrostbiteCheckFunction(275);
export const checkFrostbite300Achieved = createFrostbiteCheckFunction(300);
export const checkFrostbite315Achieved = createFrostbiteCheckFunction(315);
export const checkFrostbite325Achieved = createFrostbiteCheckFunction(325);
export const checkFrostbite330Achieved = createFrostbiteCheckFunction(330);
export const checkFrostbite340Achieved = createFrostbiteCheckFunction(340);
export const checkFrostbite350Achieved = createFrostbiteCheckFunction(350);
export const checkFrostbite355Achieved = createFrostbiteCheckFunction(355);

/**
 * Map of achievement IDs to their check functions
 */
export const FROSTBITE_CHECK_FUNCTIONS = {
  'frostbite_200': checkFrostbite200Achieved,
  'frostbite_225': checkFrostbite225Achieved,
  'frostbite_250': checkFrostbite250Achieved,
  'frostbite_275': checkFrostbite275Achieved,
  'frostbite_300': checkFrostbite300Achieved,
  'frostbite_315': checkFrostbite315Achieved,
  'frostbite_325': checkFrostbite325Achieved,
  'frostbite_330': checkFrostbite330Achieved,
  'frostbite_340': checkFrostbite340Achieved,
  'frostbite_350': checkFrostbite350Achieved,
  'frostbite_355': checkFrostbite355Achieved,
} as const;