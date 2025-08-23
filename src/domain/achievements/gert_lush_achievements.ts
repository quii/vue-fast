/**
 * Gert Lush Achievement Group
 * 
 * Achievements for shooting 12 dozen imperial rounds
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types.js';
import { roundConfigManager } from '../scoring/game_types.js';
import { FOR_THE_GERT_LUSH_GROUP } from './groups.js';

/**
 * Helper function to determine if a round is a 12 dozen imperial round
 * @param gameType The name of the game type/round
 * @returns true if the round is imperial and has exactly 12 dozen arrows
 */
export function isTwelveDozensImperialRound(gameType: string): boolean {
  const config = roundConfigManager.getConfig(gameType);
  if (!config) {
    return false;
  }
  
  // Must be imperial
  if (!config.isImperial) {
    return false;
  }
  
  // Calculate total dozens from distancesRoundSizes
  const totalDozens = config.distancesRoundSizes?.reduce((sum, dozens) => sum + dozens, 0) || 0;
  
  // Must be exactly 12 dozen
  return totalDozens === 12;
}

/**
 * Counts the number of completed 12 dozen imperial rounds in shoot history
 * @param context Achievement context containing shoot history
 * @returns Number of completed 12 dozen imperial rounds
 */
function countCompletedTwelveDozensImperialRounds(context: AchievementContext): number {
  return context.shootHistory.reduce((count, historyItem) => {
    return historyItem.gameType && isTwelveDozensImperialRound(historyItem.gameType) 
      ? count + 1 
      : count;
  }, 0);
}

/**
 * Generic function to check Gert Lush achievement progress
 * @param context Achievement context containing shoot history
 * @param targetRounds Target number of rounds needed for this tier
 * @returns Achievement progress
 */
function checkGertLushAchievement(context: AchievementContext, targetRounds: number): AchievementProgress {
  const completedRounds = countCompletedTwelveDozensImperialRounds(context);
  const isUnlocked = completedRounds >= targetRounds;
  
  if (!isUnlocked) {
    return {
      totalArrows: completedRounds,
      targetArrows: targetRounds,
      isUnlocked: false
    };
  }
  
  // Find the shoot that achieved this milestone (Nth completed round)
  const twelveDozensImperialRounds = context.shootHistory.filter(historyItem => 
    historyItem.gameType && isTwelveDozensImperialRound(historyItem.gameType)
  );
  
  const achievingShoot = twelveDozensImperialRounds[targetRounds - 1]; // 0-indexed
  
  return {
    totalArrows: completedRounds,
    targetArrows: targetRounds,
    isUnlocked: true,
    unlockedAt: achievingShoot?.date,
    achievingShootId: achievingShoot?.id,
    achievedDate: achievingShoot?.date
  };
}

/**
 * Check if Gert Lush Bronze achievement is earned (1 twelve dozen imperial round)
 */
export function checkGertLushBronzeAchieved(context: AchievementContext): AchievementProgress {
  return checkGertLushAchievement(context, 1);
}

/**
 * Check if Gert Lush Silver achievement is earned (5 twelve dozen imperial rounds)
 */
export function checkGertLushSilverAchieved(context: AchievementContext): AchievementProgress {
  return checkGertLushAchievement(context, 5);
}

/**
 * Check if Gert Lush Gold achievement is earned (25 twelve dozen imperial rounds)
 */
export function checkGertLushGoldAchieved(context: AchievementContext): AchievementProgress {
  return checkGertLushAchievement(context, 25);
}

/**
 * Check if Gert Lush Diamond achievement is earned (50 twelve dozen imperial rounds)
 */
export function checkGertLushDiamondAchieved(context: AchievementContext): AchievementProgress {
  return checkGertLushAchievement(context, 50);
}

// Export check functions for registry
export const GERT_LUSH_CHECK_FUNCTIONS = {
  gert_lush_bronze: checkGertLushBronzeAchieved,
  gert_lush_silver: checkGertLushSilverAchieved,
  gert_lush_gold: checkGertLushGoldAchieved,
  gert_lush_diamond: checkGertLushDiamondAchieved
} as const;

// Achievement definitions
export const GERT_LUSH_BRONZE: Achievement = {
  id: 'gert_lush_bronze',
  name: 'Gert Lush (Bronze)',
  description: 'Complete 1 twelve dozen imperial round',
  tier: 'bronze',
  targetArrows: 1,
  group: FOR_THE_GERT_LUSH_GROUP
};

export const GERT_LUSH_SILVER: Achievement = {
  id: 'gert_lush_silver',
  name: 'Gert Lush (Silver)',
  description: 'Complete 5 twelve dozen imperial rounds',
  tier: 'silver',
  targetArrows: 5,
  group: FOR_THE_GERT_LUSH_GROUP
};

export const GERT_LUSH_GOLD: Achievement = {
  id: 'gert_lush_gold',
  name: 'Gert Lush (Gold)',
  description: 'Complete 25 twelve dozen imperial rounds',
  tier: 'gold',
  targetArrows: 25,
  group: FOR_THE_GERT_LUSH_GROUP
};

export const GERT_LUSH_DIAMOND: Achievement = {
  id: 'gert_lush_diamond',
  name: 'Gert Lush (Diamond)',
  description: 'Complete 50 twelve dozen imperial rounds',
  tier: 'diamond',
  targetArrows: 50,
  group: FOR_THE_GERT_LUSH_GROUP
};

export const GERT_LUSH_ACHIEVEMENTS: Achievement[] = [
  GERT_LUSH_BRONZE,
  GERT_LUSH_SILVER,
  GERT_LUSH_GOLD,
  GERT_LUSH_DIAMOND
];