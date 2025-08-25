/**
 * "Yes, I do have a sight mark" Achievement System
 * 
 * Awards for scoring >40 in an end at each imperial distance
 * Individual achievements for each distance: 10, 20, 30, 40, 50, 60, 80, 100 yards
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { calculateDistanceTotals } from '../scoring/distance_totals.js';
import { calculateSubtotals } from '../scoring/subtotals.js';
import { YES_I_DO_HAVE_A_SIGHT_MARK_GROUP } from './groups.js';

// All imperial distances for sight mark awards
const IMPERIAL_DISTANCES = [10, 20, 30, 40, 50, 60, 80, 100] as const;

type ImperialDistance = typeof IMPERIAL_DISTANCES[number];

/**
 * Determine tier based on distance (as specified in issue)
 */
function getTierForDistance(distance: ImperialDistance): 'bronze' | 'silver' | 'gold' | 'diamond' {
  if (distance < 40) {
    return 'bronze';
  } else if (distance < 60) {
    return 'silver';
  } else if (distance < 80) {
    return 'gold';
  } else {
    return 'diamond';
  }
}

/**
 * Higher-order function to create a sight mark achievement for a specific distance
 */
function createSightMarkAchievement(distance: ImperialDistance): Achievement {
  const tier = getTierForDistance(distance);
  
  return {
    id: `sight_mark_at_${distance}yd`,
    name: `Sight Mark at ${distance}yd`,
    description: `Score over 40 in an end at ${distance} yards`,
    tier,
    group: YES_I_DO_HAVE_A_SIGHT_MARK_GROUP
  };
}

/**
 * Generate all sight mark achievements
 */
export const SIGHT_MARK_ACHIEVEMENTS: Achievement[] = IMPERIAL_DISTANCES.map(distance => 
  createSightMarkAchievement(distance)
);

/**
 * Check if an end total is >40 points
 */
function isHighScoringEnd(endTotal: number): boolean {
  return endTotal > 40;
}

/**
 * Check if this distance can award sight mark based on round configuration
 */
function canAwardSightMarkAtDistance(roundName: string, targetDistance: number): boolean {
  const config = roundConfigManager.getConfig(roundName);
  if (!config || !config.isImperial) {
    return false; // Only imperial rounds can award imperial distance achievements
  }
  
  // Get all distances for this round
  const distances: number[] = [];
  if (config.maxDistanceYards) {
    distances.push(Number(config.maxDistanceYards));
  }
  if (config.otherDistancesYards) {
    distances.push(...config.otherDistancesYards.map(Number));
  }

  // Check if this distance is shot in this round
  return distances.includes(targetDistance);
}

/**
 * Check for high scoring end (>40) at a specific distance
 */
function hasHighScoringEndAtDistance(scores: any[], gameType: string, targetDistance: number): boolean {
  if (!scores || scores.length === 0) {
    return false;
  }

  if (!canAwardSightMarkAtDistance(gameType, targetDistance)) {
    return false;
  }

  // Use domain function to get distance breakdown
  const distanceRounds = calculateDistanceTotals(scores, gameType, 6);
  
  // Find the round at the target distance (could be string or number)
  const targetDistanceRound = distanceRounds.find(round => 
    round.distance === targetDistance || 
    round.distance === targetDistance.toString()
  );
  if (!targetDistanceRound) {
    return false;
  }

  // Check all ends at this distance for high scoring (>40) patterns
  for (const endPair of targetDistanceRound.roundBreakdown) {
    if (endPair.firstEnd && endPair.firstEnd.length > 0) {
      const firstEndSubtotals = calculateSubtotals(endPair.firstEnd, gameType);
      if (isHighScoringEnd(firstEndSubtotals.totalScore)) {
        return true;
      }
    }
    if (endPair.secondEnd && endPair.secondEnd.length > 0) {
      const secondEndSubtotals = calculateSubtotals(endPair.secondEnd, gameType);
      if (isHighScoringEnd(secondEndSubtotals.totalScore)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Higher-order function to create the achievement check function for a specific distance
 */
function createSightMarkCheckFunction(distance: ImperialDistance) {
  return function checkSightMarkAtDistanceAchieved(context: AchievementContext): AchievementProgress {
    // Check current shoot first
    const currentShootProgress = checkSightMarkInCurrentShoot(context, distance);
    if (currentShootProgress.isUnlocked) {
      return currentShootProgress;
    }

    // Check historical shoots
    const historicalProgress = checkSightMarkInHistory(context, distance);
    if (historicalProgress.isUnlocked) {
      return historicalProgress;
    }

    // Not achieved yet
    return {
      isUnlocked: false
    };
  };
}

/**
 * Check current shoot for sight mark achievement
 */
function checkSightMarkInCurrentShoot(
  context: AchievementContext, 
  distance: ImperialDistance
): AchievementProgress {
  const { currentShoot } = context;
  
  // Check if current shoot has high scoring end at this distance
  if (!currentShoot.gameType || !hasHighScoringEndAtDistance(currentShoot.scores, currentShoot.gameType, distance)) {
    return {
      isUnlocked: false
    };
  }

  return {
    isUnlocked: true,
    unlockedAt: currentShoot.date || new Date().toISOString(),
    achievingShootId: currentShoot.id,
    achievedDate: currentShoot.date
  };
}

/**
 * Check history for sight mark achievement
 */
function checkSightMarkInHistory(
  context: AchievementContext, 
  distance: ImperialDistance
): AchievementProgress {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && hasHighScoringEndAtDistance(historyItem.scores, historyItem.gameType, distance)) {
      return {
        isUnlocked: true,
        unlockedAt: historyItem.date,
        achievingShootId: historyItem.id,
        achievedDate: historyItem.date
      };
    }
  }

  return {
    isUnlocked: false
  };
}

/**
 * Export individual check functions for each distance
 */
export const checkSightMarkAt10ydAchieved = createSightMarkCheckFunction(10);
export const checkSightMarkAt20ydAchieved = createSightMarkCheckFunction(20);
export const checkSightMarkAt30ydAchieved = createSightMarkCheckFunction(30);
export const checkSightMarkAt40ydAchieved = createSightMarkCheckFunction(40);
export const checkSightMarkAt50ydAchieved = createSightMarkCheckFunction(50);
export const checkSightMarkAt60ydAchieved = createSightMarkCheckFunction(60);
export const checkSightMarkAt80ydAchieved = createSightMarkCheckFunction(80);
export const checkSightMarkAt100ydAchieved = createSightMarkCheckFunction(100);

/**
 * Map of achievement IDs to their check functions
 */
export const SIGHT_MARK_CHECK_FUNCTIONS = {
  'sight_mark_at_10yd': checkSightMarkAt10ydAchieved,
  'sight_mark_at_20yd': checkSightMarkAt20ydAchieved,
  'sight_mark_at_30yd': checkSightMarkAt30ydAchieved,
  'sight_mark_at_40yd': checkSightMarkAt40ydAchieved,
  'sight_mark_at_50yd': checkSightMarkAt50ydAchieved,
  'sight_mark_at_60yd': checkSightMarkAt60ydAchieved,
  'sight_mark_at_80yd': checkSightMarkAt80ydAchieved,
  'sight_mark_at_100yd': checkSightMarkAt100ydAchieved,
} as const;