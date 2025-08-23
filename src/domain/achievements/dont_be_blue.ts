/**
 * Don't Be Blue Achievement System
 * 
 * Awards for scoring specific ends:
 * - Imperial distances: all 5s in an end
 * - Metric distances: all 5s or all 6s (or mixed 5s/6s) in an end
 * Tiers follow same distance-based pattern as Red Alert
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { DONT_BE_BLUE_GROUP } from './groups.js';
import { calculateDistanceTotals } from '../scoring/distance_totals.js';

// All possible distances for Don't Be Blue awards (same as Red Alert)
const IMPERIAL_DISTANCES = [20, 30, 40, 50, 60, 80, 100] as const;
const METRIC_DISTANCES = [20, 30, 40, 50, 60, 70, 90] as const;

type ImperialDistance = typeof IMPERIAL_DISTANCES[number];
type MetricDistance = typeof METRIC_DISTANCES[number];
type Distance = ImperialDistance | MetricDistance;

/**
 * Convert scores to numeric values for Don't Be Blue checking (includes misses as 0)
 * Same logic as Red Alert - preserves all arrows including misses
 */
function convertScoresForDontBeBlue(scores: any[], gameType: string): number[] {
  return scores.map(score => {
    if (score === 'M' || score === 'MISS') {
      return 0;
    }
    if (score === 'X') {
      // Handle Worcester special case
      if (gameType?.toLowerCase().includes('worcester')) {
        return 5;
      }
      return 10;
    }
    // Return the score as-is if it's already a number, or try to convert
    return typeof score === 'number' ? score : Number(score) || 0;
  });
}

/**
 * Determine tier based on distance (same as Red Alert)
 */
function getTierForDistance(distance: Distance): 'bronze' | 'silver' | 'gold' | 'diamond' {
  if (distance <= 30) {
    return 'bronze';
  } else if (distance <= 50) {
    return 'silver';
  } else if (distance <= 70) {
    return 'gold';
  } else {
    return 'diamond';
  }
}

/**
 * Higher-order function to create a Don't Be Blue achievement for a specific distance
 */
function createDontBeBlueAchievement(distance: Distance, isImperial: boolean): Achievement {
  const unit = isImperial ? 'yd' : 'm';
  const tier = getTierForDistance(distance);
  const description = isImperial 
    ? `Score an end of all 5s at ${distance}${unit}`
    : `Score an end of all 5s or 6s (or mixed) at ${distance}${unit}`;
  
  return {
    id: `dont_be_blue_at_${distance}${unit}`,
    name: `Don't Be Blue at ${distance}${unit}`,
    description,
    tier,
    group: DONT_BE_BLUE_GROUP
  };
}

/**
 * Generate all Don't Be Blue achievements, ordered by distance (mixed imperial/metric)
 */
export const DONT_BE_BLUE_ACHIEVEMENTS: Achievement[] = (() => {
  const allAchievements = [
    ...IMPERIAL_DISTANCES.map(d => ({ distance: d, isImperial: true })),
    ...METRIC_DISTANCES.map(d => ({ distance: d, isImperial: false }))
  ];
  
  // Sort by distance first, then by unit (imperial first for same distance)
  allAchievements.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    // If same distance, imperial (yards) comes before metric (meters)
    return a.isImperial ? -1 : 1;
  });
  
  return allAchievements.map(({ distance, isImperial }) => 
    createDontBeBlueAchievement(distance, isImperial)
  );
})();

/**
 * Check if an end meets Don't Be Blue criteria
 */
function isDontBeBlueEnd(end: any[], gameType: string, isImperial: boolean): boolean {
  if (!end || end.length === 0) {
    return false;
  }

  // Use Don't Be Blue-specific conversion that includes misses as 0s
  const numericScores = convertScoresForDontBeBlue(end, gameType);

  if (isImperial) {
    // Imperial: all scores must be 5
    return numericScores.every(score => score === 5);
  } else {
    // Metric: all scores must be 5 or 6 (can be mixed)
    return numericScores.every(score => score === 5 || score === 6);
  }
}

/**
 * Check if this distance can award Don't Be Blue based on round configuration
 */
function canAwardDontBeBlueAtDistance(roundName: string, targetDistance: number): { canAward: boolean; isImperial: boolean } {
  const config = roundConfigManager.getConfig(roundName);
  if (!config) {
    return { canAward: false, isImperial: false };
  }

  const isImperial = config.isImperial;
  
  // Get all distances for this round
  const distances: number[] = [];
  if (isImperial) {
    if (config.maxDistanceYards) {
      distances.push(config.maxDistanceYards);
    }
    if (config.otherDistancesYards) {
      distances.push(...config.otherDistancesYards);
    }
  } else {
    if (config.maxDistanceMetres) {
      distances.push(config.maxDistanceMetres);
    }
    if (config.otherDistancesMetres) {
      distances.push(...config.otherDistancesMetres);
    }
  }

  // Check if this distance is shot in this round
  return {
    canAward: distances.includes(targetDistance),
    isImperial
  };
}

/**
 * Check for Don't Be Blue end at a specific distance using domain functions
 */
function hasDontBeBlueEndAtDistance(scores: any[], gameType: string, targetDistance: number): boolean {
  if (!scores || scores.length === 0) {
    return false;
  }

  const { canAward, isImperial } = canAwardDontBeBlueAtDistance(gameType, targetDistance);
  if (!canAward) {
    return false;
  }

  // Use domain function to get distance breakdown
  const distanceRounds = calculateDistanceTotals(scores, gameType, 6);
  
  // Find the round at the target distance
  const targetDistanceRound = distanceRounds.find(round => round.distance === targetDistance);
  if (!targetDistanceRound) {
    return false;
  }

  // Check all ends at this distance for Don't Be Blue patterns
  for (const endPair of targetDistanceRound.roundBreakdown) {
    if (endPair.firstEnd && isDontBeBlueEnd(endPair.firstEnd, gameType, isImperial)) {
      return true;
    }
    if (endPair.secondEnd && isDontBeBlueEnd(endPair.secondEnd, gameType, isImperial)) {
      return true;
    }
  }

  return false;
}

/**
 * Higher-order function to create the achievement check function for a specific distance
 */
function createDontBeBlueCheckFunction(distance: Distance, isImperial: boolean) {
  return function checkDontBeBlueAtDistanceAchieved(context: AchievementContext): AchievementProgress {
    // First check if we've already achieved this
    const existingAchievement = findExistingDontBeBlueAchievement(context, distance, isImperial);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check current shoot
    const currentShootProgress = checkDontBeBlueInCurrentShoot(context, distance, isImperial);
    if (currentShootProgress.isUnlocked) {
      return currentShootProgress;
    }

    // Check historical shoots
    const historicalProgress = checkDontBeBlueInHistory(context, distance, isImperial);
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
 * Check for existing Don't Be Blue achievement in history
 */
function findExistingDontBeBlueAchievement(
  context: AchievementContext, 
  distance: Distance, 
  isImperial: boolean
): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && hasDontBeBlueEndAtDistance(historyItem.scores, historyItem.gameType, distance)) {
      const { canAward, isImperial: roundIsImperial } = canAwardDontBeBlueAtDistance(historyItem.gameType, distance);
      
      // Make sure the round type matches what we're looking for
      if (canAward && roundIsImperial === isImperial) {
        return {
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
 * Check current shoot for Don't Be Blue achievement
 */
function checkDontBeBlueInCurrentShoot(
  context: AchievementContext, 
  distance: Distance, 
  isImperial: boolean
): AchievementProgress {
  const { currentShoot } = context;
  
  // Check if current shoot has Don't Be Blue end at this distance
  if (!currentShoot.gameType || !hasDontBeBlueEndAtDistance(currentShoot.scores, currentShoot.gameType, distance)) {
    return {
      isUnlocked: false
    };
  }

  const { canAward, isImperial: roundIsImperial } = canAwardDontBeBlueAtDistance(currentShoot.gameType, distance);
  
  // Make sure the round type matches what we're looking for
  if (!canAward || roundIsImperial !== isImperial) {
    return {
      isUnlocked: false
    };
  }

  return {
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    achievingShootId: currentShoot.id,
    achievedDate: currentShoot.date
  };
}

/**
 * Check history for Don't Be Blue achievement
 */
function checkDontBeBlueInHistory(
  context: AchievementContext, 
  distance: Distance, 
  isImperial: boolean
): AchievementProgress {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && hasDontBeBlueEndAtDistance(historyItem.scores, historyItem.gameType, distance)) {
      const { canAward, isImperial: roundIsImperial } = canAwardDontBeBlueAtDistance(historyItem.gameType, distance);
      
      // Make sure the round type matches what we're looking for
      if (canAward && roundIsImperial === isImperial) {
        return {
          isUnlocked: true,
          unlockedAt: historyItem.date,
          achievingShootId: historyItem.id,
          achievedDate: historyItem.date
        };
      }
    }
  }

  return {
    isUnlocked: false
  };
}

/**
 * Export individual check functions for each distance
 */
export const checkDontBeBlueAt20ydAchieved = createDontBeBlueCheckFunction(20, true);
export const checkDontBeBlueAt30ydAchieved = createDontBeBlueCheckFunction(30, true);
export const checkDontBeBlueAt40ydAchieved = createDontBeBlueCheckFunction(40, true);
export const checkDontBeBlueAt50ydAchieved = createDontBeBlueCheckFunction(50, true);
export const checkDontBeBlueAt60ydAchieved = createDontBeBlueCheckFunction(60, true);
export const checkDontBeBlueAt80ydAchieved = createDontBeBlueCheckFunction(80, true);
export const checkDontBeBlueAt100ydAchieved = createDontBeBlueCheckFunction(100, true);

export const checkDontBeBlueAt20mAchieved = createDontBeBlueCheckFunction(20, false);
export const checkDontBeBlueAt30mAchieved = createDontBeBlueCheckFunction(30, false);
export const checkDontBeBlueAt40mAchieved = createDontBeBlueCheckFunction(40, false);
export const checkDontBeBlueAt50mAchieved = createDontBeBlueCheckFunction(50, false);
export const checkDontBeBlueAt60mAchieved = createDontBeBlueCheckFunction(60, false);
export const checkDontBeBlueAt70mAchieved = createDontBeBlueCheckFunction(70, false);
export const checkDontBeBlueAt90mAchieved = createDontBeBlueCheckFunction(90, false);

/**
 * Map of achievement IDs to their check functions
 */
export const DONT_BE_BLUE_CHECK_FUNCTIONS = {
  'dont_be_blue_at_20yd': checkDontBeBlueAt20ydAchieved,
  'dont_be_blue_at_30yd': checkDontBeBlueAt30ydAchieved,
  'dont_be_blue_at_40yd': checkDontBeBlueAt40ydAchieved,
  'dont_be_blue_at_50yd': checkDontBeBlueAt50ydAchieved,
  'dont_be_blue_at_60yd': checkDontBeBlueAt60ydAchieved,
  'dont_be_blue_at_80yd': checkDontBeBlueAt80ydAchieved,
  'dont_be_blue_at_100yd': checkDontBeBlueAt100ydAchieved,
  'dont_be_blue_at_20m': checkDontBeBlueAt20mAchieved,
  'dont_be_blue_at_30m': checkDontBeBlueAt30mAchieved,
  'dont_be_blue_at_40m': checkDontBeBlueAt40mAchieved,
  'dont_be_blue_at_50m': checkDontBeBlueAt50mAchieved,
  'dont_be_blue_at_60m': checkDontBeBlueAt60mAchieved,
  'dont_be_blue_at_70m': checkDontBeBlueAt70mAchieved,
  'dont_be_blue_at_90m': checkDontBeBlueAt90mAchieved,
} as const;