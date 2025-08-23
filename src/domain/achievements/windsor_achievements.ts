/**
 * For the Windsor Achievement Group
 * 
 * Achievements for shooting 9 dozen imperial rounds
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types.js';
import { roundConfigManager } from '../scoring/game_types.js';
import { FOR_THE_WINDSOR_GROUP } from './groups.js';

/**
 * Helper function to determine if a round is a 9 dozen imperial round
 * @param gameType The name of the game type/round
 * @returns true if the round is imperial and has exactly 9 dozen arrows
 */
export function isNineDozensImperialRound(gameType: string): boolean {
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
  
  // Must be exactly 9 dozen
  return totalDozens === 9;
}

/**
 * Counts the number of completed 9 dozen imperial rounds in shoot history
 * @param context Achievement context containing shoot history
 * @returns Number of completed 9 dozen imperial rounds
 */
function countCompletedNineDozensImperialRounds(context: AchievementContext): number {
  return context.shootHistory.reduce((count, historyItem) => {
    return historyItem.gameType && isNineDozensImperialRound(historyItem.gameType) 
      ? count + 1 
      : count;
  }, 0);
}

/**
 * Generic function to check Windsor achievement progress
 * @param context Achievement context containing shoot history
 * @param targetRounds Target number of rounds needed for this tier
 * @returns Achievement progress
 */
function checkWindsorAchievement(context: AchievementContext, targetRounds: number): AchievementProgress {
  const completedRounds = countCompletedNineDozensImperialRounds(context);
  const isUnlocked = completedRounds >= targetRounds;
  
  if (!isUnlocked) {
    return {
      totalArrows: completedRounds,
      targetArrows: targetRounds,
      isUnlocked: false
    };
  }
  
  // Find the shoot that achieved this milestone (Nth completed round)
  const nineDozensImperialRounds = context.shootHistory.filter(historyItem => 
    historyItem.gameType && isNineDozensImperialRound(historyItem.gameType)
  );
  
  const achievingShoot = nineDozensImperialRounds[targetRounds - 1]; // 0-indexed
  
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
 * Check if For the Windsor Bronze achievement is earned (5 nine dozen imperial rounds)
 */
export function checkForTheWindsorBronzeAchieved(context: AchievementContext): AchievementProgress {
  return checkWindsorAchievement(context, 5);
}

/**
 * Check if For the Windsor Silver achievement is earned (10 nine dozen imperial rounds)
 */
export function checkForTheWindsorSilverAchieved(context: AchievementContext): AchievementProgress {
  return checkWindsorAchievement(context, 10);
}

/**
 * Check if For the Windsor Gold achievement is earned (25 nine dozen imperial rounds)
 */
export function checkForTheWindsorGoldAchieved(context: AchievementContext): AchievementProgress {
  return checkWindsorAchievement(context, 25);
}

/**
 * Check if For the Windsor Diamond achievement is earned (50 nine dozen imperial rounds)
 */
export function checkForTheWindsorDiamondAchieved(context: AchievementContext): AchievementProgress {
  return checkWindsorAchievement(context, 50);
}

// Export check functions for registry
export const WINDSOR_CHECK_FUNCTIONS = {
  for_the_windsor_bronze: checkForTheWindsorBronzeAchieved,
  for_the_windsor_silver: checkForTheWindsorSilverAchieved,
  for_the_windsor_gold: checkForTheWindsorGoldAchieved,
  for_the_windsor_diamond: checkForTheWindsorDiamondAchieved
} as const;

// Achievement definitions
export const FOR_THE_WINDSOR_BRONZE: Achievement = {
  id: 'for_the_windsor_bronze',
  name: 'For the Windsor (Bronze)',
  description: 'Complete 5 nine dozen imperial rounds',
  tier: 'bronze',
  targetArrows: 5,
  group: FOR_THE_WINDSOR_GROUP
};

export const FOR_THE_WINDSOR_SILVER: Achievement = {
  id: 'for_the_windsor_silver',
  name: 'For the Windsor (Silver)',
  description: 'Complete 10 nine dozen imperial rounds',
  tier: 'silver',
  targetArrows: 10,
  group: FOR_THE_WINDSOR_GROUP
};

export const FOR_THE_WINDSOR_GOLD: Achievement = {
  id: 'for_the_windsor_gold',
  name: 'For the Windsor (Gold)',
  description: 'Complete 25 nine dozen imperial rounds',
  tier: 'gold',
  targetArrows: 25,
  group: FOR_THE_WINDSOR_GROUP
};

export const FOR_THE_WINDSOR_DIAMOND: Achievement = {
  id: 'for_the_windsor_diamond',
  name: 'For the Windsor (Diamond)',
  description: 'Complete 50 nine dozen imperial rounds',
  tier: 'diamond',
  targetArrows: 50,
  group: FOR_THE_WINDSOR_GROUP
};

export const WINDSOR_ACHIEVEMENTS: Achievement[] = [
  FOR_THE_WINDSOR_BRONZE,
  FOR_THE_WINDSOR_SILVER,
  FOR_THE_WINDSOR_GOLD,
  FOR_THE_WINDSOR_DIAMOND
];