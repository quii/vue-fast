/**
 * Yorkie Achievement System
 * 
 * Awards for female archers achieving excellence at the York round
 * Only available to female archers shooting York rounds
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { YORKIE_GROUP } from './groups.js';
import { calculateTotal } from '@/domain/scoring/subtotals.js';
import { convertToValues } from '@/domain/scoring/scores.js';
import { calculateDistanceTotals, type DistanceRound } from '../scoring/distance_totals.js';

// Yorkie achievement definitions
const YORKIE_ACHIEVEMENTS_DATA = [
  { id: 'smash_the_patriarchy', name: 'Smash the patriarchy', description: 'Complete a York round', tier: 'diamond' as const, type: 'completion' },
  { id: 'yorkie_not_for_girls', name: "Yorkie, it's not for girls?", description: 'Score 0 for an end at 100 yards', tier: 'bronze' as const, type: 'end_score', targetScore: 0 },
  { id: 'yorkie_for_girls_silver', name: "Yorkie, it's for girls", description: 'Score over 24 for an end at 100 yards', tier: 'silver' as const, type: 'end_score', targetScore: 25 },
  { id: 'yorkie_for_girls_gold', name: "Yorkie it's for girls", description: 'Score over 31 for an end at 100 yards', tier: 'gold' as const, type: 'end_score', targetScore: 32 },
  { id: 'yorkie_for_girls_diamond', name: "Yorkie, it's for girls", description: 'Score over 41 in an end at 100 yards', tier: 'diamond' as const, type: 'end_score', targetScore: 42 }
] as const;

/**
 * Generate all Yorkie achievements
 */
export const YORKIE_ACHIEVEMENTS: Achievement[] = YORKIE_ACHIEVEMENTS_DATA.map(data => ({
  id: data.id,
  name: data.name,
  tier: data.tier,
  description: data.description,
  targetScore: data.targetScore,
  gameType: 'york',
  group: YORKIE_GROUP
}));

/**
 * Check if user is female
 */
function isFemaleArcher(userProfile?: { gender?: string }): boolean {
  return userProfile?.gender === 'female';
}

/**
 * Check if game type is York round
 */
function isYorkRound(gameType: string): boolean {
  return gameType.toLowerCase() === 'york';
}

/**
 * Find the best or worst end score at 100 yards using domain functions
 */
function findEndScoreAt100Yards(scores: any[], gameType: string, findType: 'best' | 'worst'): number {
  if (!scores || scores.length === 0) {
    return 0;
  }

  // Use domain function to get distance breakdown
  const distanceRounds = calculateDistanceTotals(scores, gameType, 6);
  
  // Find the round at 100 yards
  const hundredYardRound = distanceRounds.find(round => round.distance === 100);
  if (!hundredYardRound) {
    return 0;
  }

  // Extract all individual ends from the round breakdown
  const allEnds: any[] = [];
  for (const endPair of hundredYardRound.roundBreakdown) {
    if (endPair.firstEnd && endPair.firstEnd.length > 0) {
      allEnds.push(endPair.firstEnd);
    }
    if (endPair.secondEnd && endPair.secondEnd.length > 0) {
      allEnds.push(endPair.secondEnd);
    }
  }

  if (allEnds.length === 0) {
    return 0;
  }

  // Calculate score for each end and find best/worst
  let targetScore = findType === 'best' ? 0 : Infinity;
  
  for (const end of allEnds) {
    const endScore = calculateTotal(convertToValues(end, gameType));
    if (findType === 'best') {
      targetScore = Math.max(targetScore, endScore);
    } else {
      targetScore = Math.min(targetScore, endScore);
    }
  }
  
  return targetScore === Infinity ? 0 : targetScore;
}

/**
 * Higher-order function to create completion check function
 */
function createYorkCompletionCheckFunction() {
  return function checkSmashThePatriarchyAchieved(context: AchievementContext): AchievementProgress {
    return findExistingYorkCompletion(context) || {
      isUnlocked: false,
      currentScore: 0,
      targetScore: 1
    };
  };
}

/**
 * Higher-order function to create end score check function
 */
function createYorkEndScoreCheckFunction(targetScore: number, checkType: 'min' | 'max' = 'min') {
  return function checkYorkEndScoreAchieved(context: AchievementContext): AchievementProgress {
    // Only check history for completed York shoots by female archers
    return findExistingYorkEndScore(context, targetScore, checkType) || 
           checkYorkEndScoreInHistory(context, targetScore, checkType);
  };
}

/**
 * Check for existing York completion achievement in history
 */
function findExistingYorkCompletion(context: AchievementContext): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (isFemaleArcher(historyItem.userProfile) &&
        historyItem.gameType && 
        isYorkRound(historyItem.gameType)) {
      return {
        isUnlocked: true,
        unlockedAt: historyItem.date,
        achievingShootId: historyItem.id,
        achievedDate: historyItem.date,
        currentScore: 1,
        targetScore: 1
      };
    }
  }
  return null;
}



/**
 * Check for existing York end score achievement in history
 */
function findExistingYorkEndScore(context: AchievementContext, targetScore: number, checkType: 'min' | 'max'): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (isFemaleArcher(historyItem.userProfile) && 
        historyItem.gameType && 
        isYorkRound(historyItem.gameType)) {
      
      const findType = checkType === 'max' ? 'worst' : 'best';
      const endScore = findEndScoreAt100Yards(historyItem.scores, historyItem.gameType, findType);
      
      const hasAchieved = checkType === 'max' ? endScore <= targetScore : endScore >= targetScore;
      
      if (hasAchieved) {
        return {
          currentScore: endScore,
          targetScore: targetScore,
          isUnlocked: true,
          unlockedAt: historyItem.date,
          achievingShootId: historyItem.id,
          achievedDate: historyItem.date
        };
      }
    }
  }
  return null;
}


/**
 * Check history for best York end score attempt
 */
function checkYorkEndScoreInHistory(context: AchievementContext, targetScore: number, checkType: 'min' | 'max'): AchievementProgress {
  let bestEndScore = checkType === 'max' ? Infinity : 0;

  for (const historyItem of context.shootHistory) {
    if (isFemaleArcher(historyItem.userProfile) && 
        historyItem.gameType && 
        isYorkRound(historyItem.gameType)) {
      
      const findType = checkType === 'max' ? 'worst' : 'best';
      const endScore = findEndScoreAt100Yards(historyItem.scores, historyItem.gameType, findType);
      
      if (checkType === 'max') {
        bestEndScore = Math.min(bestEndScore, endScore);
      } else {
        bestEndScore = Math.max(bestEndScore, endScore);
      }
    }
  }

  if (bestEndScore === Infinity) {
    bestEndScore = 0;
  }

  return {
    currentScore: bestEndScore,
    targetScore: targetScore,
    isUnlocked: false
  };
}

/**
 * Export individual check functions for each achievement
 */
export const checkSmashThePatriarchyAchieved = createYorkCompletionCheckFunction();
export const checkYorkieNotForGirlsAchieved = createYorkEndScoreCheckFunction(0, 'max');
export const checkYorkieForGirlsSilverAchieved = createYorkEndScoreCheckFunction(26, 'min');
export const checkYorkieForGirlsGoldAchieved = createYorkEndScoreCheckFunction(33, 'min');
export const checkYorkieForGirlsDiamondAchieved = createYorkEndScoreCheckFunction(42, 'min');

/**
 * Map of achievement IDs to their check functions
 */
export const YORKIE_CHECK_FUNCTIONS = {
  'smash_the_patriarchy': checkSmashThePatriarchyAchieved,
  'yorkie_not_for_girls': checkYorkieNotForGirlsAchieved,
  'yorkie_for_girls_silver': checkYorkieForGirlsSilverAchieved,
  'yorkie_for_girls_gold': checkYorkieForGirlsGoldAchieved,
  'yorkie_for_girls_diamond': checkYorkieForGirlsDiamondAchieved,
} as const;