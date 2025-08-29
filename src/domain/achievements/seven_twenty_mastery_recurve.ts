/**
 * 720 Mastery (Recurve) Achievement System
 * 
 * Awards for achieving specific scores on WA 70m rounds with recurve bow
 * Only available on WA 70m shoots using recurve equipment
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { METRIC_EXCELLENCE_GROUP } from './groups.js';

// Score thresholds for each tier
const SCORE_THRESHOLDS = {
  bronze: 450,
  silver: 500,
  gold: 550,
  diamond: 600
} as const;

/**
 * Higher-order function to create a 720 mastery achievement for a specific tier
 */
function create720MasteryAchievement(tier: keyof typeof SCORE_THRESHOLDS): Achievement {
  const targetScore = SCORE_THRESHOLDS[tier];
  
  return {
    id: `seven_twenty_mastery_recurve_${tier}`,
    name: `${targetScore} @ 720 (Recurve)`,
    tier: tier,
    targetScore: targetScore,
    gameType: 'wa 70m',
    group: METRIC_EXCELLENCE_GROUP
  };
}

/**
 * Generate all 720 mastery achievements
 */
export const SEVEN_TWENTY_MASTERY_ACHIEVEMENTS: Achievement[] = [
  create720MasteryAchievement('bronze'),
  create720MasteryAchievement('silver'),
  create720MasteryAchievement('gold'),
  create720MasteryAchievement('diamond')
];

/**
 * Higher-order function to create the achievement check function for a specific tier
 */
function create720MasteryCheckFunction(tier: keyof typeof SCORE_THRESHOLDS) {
  return function check720MasteryAtTierAchieved(context: AchievementContext): AchievementProgress {
    const targetScore = SCORE_THRESHOLDS[tier];
    const requiredGameType = 'wa 70m';
    const requiredBowType = 'recurve';
    
    // Check if we've already achieved this in history
    const existingAchievement = findExisting720MasteryAchievement(context, targetScore, requiredGameType, requiredBowType);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check historical shoots
    const historicalProgress = check720MasteryInHistory(context, targetScore, requiredGameType, requiredBowType);
    if (historicalProgress.isUnlocked) {
      return historicalProgress;
    }

    // Not achieved yet - return current best attempt
    return {
      currentScore: historicalProgress.currentScore || 0,
      targetScore: targetScore,
      isUnlocked: false
    };
  };
}

/**
 * Check for existing 720 mastery achievement in history
 */
function findExisting720MasteryAchievement(
  context: AchievementContext, 
  targetScore: number, 
  requiredGameType: string, 
  requiredBowType: string
): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType?.toLowerCase() === requiredGameType && 
        historyItem.userProfile?.bowType === requiredBowType &&
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
 * Check history for best 720 mastery attempt
 */
function check720MasteryInHistory(
  context: AchievementContext, 
  targetScore: number, 
  requiredGameType: string, 
  requiredBowType: string
): AchievementProgress {
  let bestScore = 0;
  let unlockedAt: string | undefined;
  let achievingShootId: number | string | undefined;
  let achievedDate: string | undefined;

  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType?.toLowerCase() === requiredGameType && 
        historyItem.userProfile?.bowType === requiredBowType) {
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
 * Export individual check functions for each tier
 */
export const check720MasteryBronzeAchieved = create720MasteryCheckFunction('bronze');
export const check720MasterySilverAchieved = create720MasteryCheckFunction('silver');
export const check720MasteryGoldAchieved = create720MasteryCheckFunction('gold');
export const check720MasteryDiamondAchieved = create720MasteryCheckFunction('diamond');

/**
 * Map of achievement IDs to their check functions
 */
export const SEVEN_TWENTY_MASTERY_CHECK_FUNCTIONS = {
  'seven_twenty_mastery_recurve_bronze': check720MasteryBronzeAchieved,
  'seven_twenty_mastery_recurve_silver': check720MasterySilverAchieved,
  'seven_twenty_mastery_recurve_gold': check720MasteryGoldAchieved,
  'seven_twenty_mastery_recurve_diamond': check720MasteryDiamondAchieved,
} as const;
