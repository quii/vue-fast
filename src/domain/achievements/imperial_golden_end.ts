/**
 * Imperial Golden End Awards
 * 
 * Awards for scoring 6 9s (54 points) in a single end at specific imperial distances
 * Only available on imperial shoots.
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { IMPERIAL_GOLDEN_END_GROUP } from './groups.js';
import { calculateTotal } from '@/domain/scoring/subtotals.js';
import { convertToValues } from '@/domain/scoring/scores.js';
import { calculateDistanceTotals, type DistanceRound } from '../scoring/distance_totals.js';

// Imperial distances for golden end awards
const IMPERIAL_DISTANCES = [10, 20, 30, 40, 50, 60, 80, 100] as const;
type ImperialDistance = typeof IMPERIAL_DISTANCES[number];

/**
 * Higher-order function to create a golden end achievement for a specific distance
 */
function createGoldenEndAchievement(distance: ImperialDistance): Achievement {
  // Determine tier based on distance
  let tier: string;
  if (distance === 10 || distance === 20 || distance === 30) {
    tier = 'bronze';
  } else if (distance === 40 || distance === 50) {
    tier = 'silver';
  } else if (distance === 60) {
    tier = 'gold';
  } else if (distance === 80 || distance === 100) {
    tier = 'diamond'; // Using diamond instead of platinum as we don't have platinum tier
  } else {
    tier = 'bronze';
  }

  return {
    id: `golden_end_at_${distance}yd`,
    name: `Golden End at ${distance}yd`,
    tier: tier as any,
    targetScore: 54,
    group: IMPERIAL_GOLDEN_END_GROUP
  };
}

/**
 * Generate all golden end achievements for imperial distances
 */
export const GOLDEN_END_ACHIEVEMENTS: Achievement[] = IMPERIAL_DISTANCES.map(createGoldenEndAchievement);

/**
 * Higher-order function to create the achievement check function for a specific distance
 */
function createGoldenEndCheckFunction(distance: ImperialDistance) {
  return function checkGoldenEndAtDistanceAchieved(context: AchievementContext): AchievementProgress {
    // First check if we've already achieved this
    const existingAchievement = findExistingGoldenEndAchievement(context, distance);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check historical shoots only - achievements are only awarded from completed shoots
    const historicalProgress = checkGoldenEndInHistory(context, distance);
    if (historicalProgress.isUnlocked) {
      return historicalProgress;
    }

    // Not achieved yet - return best historical attempt
    return {
      currentScore: historicalProgress.currentScore || 0,
      targetScore: 54,
      isUnlocked: false
    };
  };
}

/**
 * Check if this distance can award golden end based on round configuration
 */
function canAwardGoldenEndAtDistance(roundName: string, targetDistance: number): boolean {
  const config = roundConfigManager.getConfig(roundName);
  if (!config || !config.isImperial) {
    return false;
  }

  // Get all distances for this round
  const distances: number[] = [];
  if (config.maxDistanceYards) {
    distances.push(config.maxDistanceYards);
  }
  if (config.otherDistancesYards) {
    distances.push(...config.otherDistancesYards);
  }

  // Check if this distance is shot in this round
  return distances.includes(targetDistance);
}

/**
 * Find the best end score at a specific distance using domain functions
 */
function findBestEndAtDistance(scores: any[], gameType: string, targetDistance: number): number {
  if (!scores || scores.length === 0) {
    return 0;
  }

  // Use domain function to get distance breakdown
  const distanceRounds = calculateDistanceTotals(scores, gameType, 6);
  
  // Find the round at the target distance
  const targetDistanceRound = distanceRounds.find(round => round.distance === targetDistance);
  if (!targetDistanceRound) {
    return 0;
  }

  // Extract all individual ends from the round breakdown
  const allEnds: any[] = [];
  for (const endPair of targetDistanceRound.roundBreakdown) {
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

  // Calculate score for each end and find the best
  let bestEndScore = 0;
  
  for (const end of allEnds) {
    const endScore = calculateTotal(convertToValues(end, gameType));
    bestEndScore = Math.max(bestEndScore, endScore);
  }
  
  return bestEndScore;
}

/**
 * Check for existing golden end achievement in history
 */
function findExistingGoldenEndAchievement(context: AchievementContext, distance: ImperialDistance): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAwardGoldenEndAtDistance(historyItem.gameType, distance)) {
      const bestEndScore = findBestEndAtDistance(historyItem.scores, historyItem.gameType, distance);
      
      if (bestEndScore >= 54) {
        return {
          currentScore: bestEndScore,
          targetScore: 54,
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
 * Check history for best golden end attempt
 */
function checkGoldenEndInHistory(context: AchievementContext, distance: ImperialDistance): AchievementProgress {
  let bestEndScore = 0;
  let achievingShoot = null;

  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAwardGoldenEndAtDistance(historyItem.gameType, distance)) {
      const endScore = findBestEndAtDistance(historyItem.scores, historyItem.gameType, distance);
      if (endScore > bestEndScore) {
        bestEndScore = endScore;
        if (endScore >= 54) {
          achievingShoot = historyItem;
        }
      }
    }
  }

  return {
    currentScore: bestEndScore,
    targetScore: 54,
    isUnlocked: bestEndScore >= 54,
    unlockedAt: achievingShoot?.date,
    achievingShootId: achievingShoot?.id,
    achievedDate: achievingShoot?.date
  };
}

/**
 * Export individual check functions for each distance
 */
export const checkGoldenEndAt10ydAchieved = createGoldenEndCheckFunction(10);
export const checkGoldenEndAt20ydAchieved = createGoldenEndCheckFunction(20);
export const checkGoldenEndAt30ydAchieved = createGoldenEndCheckFunction(30);
export const checkGoldenEndAt40ydAchieved = createGoldenEndCheckFunction(40);
export const checkGoldenEndAt50ydAchieved = createGoldenEndCheckFunction(50);
export const checkGoldenEndAt60ydAchieved = createGoldenEndCheckFunction(60);
export const checkGoldenEndAt80ydAchieved = createGoldenEndCheckFunction(80);
export const checkGoldenEndAt100ydAchieved = createGoldenEndCheckFunction(100);

/**
 * Map of achievement IDs to their check functions
 */
export const GOLDEN_END_CHECK_FUNCTIONS = {
  'golden_end_at_10yd': checkGoldenEndAt10ydAchieved,
  'golden_end_at_20yd': checkGoldenEndAt20ydAchieved,
  'golden_end_at_30yd': checkGoldenEndAt30ydAchieved,
  'golden_end_at_40yd': checkGoldenEndAt40ydAchieved,
  'golden_end_at_50yd': checkGoldenEndAt50ydAchieved,
  'golden_end_at_60yd': checkGoldenEndAt60ydAchieved,
  'golden_end_at_80yd': checkGoldenEndAt80ydAchieved,
  'golden_end_at_100yd': checkGoldenEndAt100ydAchieved,
} as const;
