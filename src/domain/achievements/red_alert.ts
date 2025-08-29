/**
 * Red Alert Achievement System
 * 
 * Awards for scoring specific ends:
 * - Imperial distances: all 7s in an end
 * - Metric distances: all 7s or all 8s (or mixed 7s/8s) in an end
 * All awards are silver tier
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { RED_ALERT_GROUP } from './groups.js';
import { calculateDistanceTotals } from '../scoring/distance_totals.js';
import { convertToValues } from '@/domain/scoring/scores.js';

// All possible distances for red alert awards
const IMPERIAL_DISTANCES = [20, 30, 40, 50, 60, 80, 100] as const;
const METRIC_DISTANCES = [20, 30, 40, 50, 60, 70, 90] as const;

type ImperialDistance = typeof IMPERIAL_DISTANCES[number];
type MetricDistance = typeof METRIC_DISTANCES[number];
type Distance = ImperialDistance | MetricDistance;

/**
 * Determine tier based on distance
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
 * Higher-order function to create a red alert achievement for a specific distance
 */
function createRedAlertAchievement(distance: Distance, isImperial: boolean): Achievement {
  const unit = isImperial ? 'yd' : 'm';
  const tier = getTierForDistance(distance);
  const description = isImperial 
    ? `Score an end of all 7s at ${distance}${unit}`
    : `Score an end of all 7s or 8s (or mixed) at ${distance}${unit}`;
  
  return {
    id: `red_alert_at_${distance}${unit}`,
    name: `Red Alert at ${distance}${unit}`,
    description,
    tier,
    group: RED_ALERT_GROUP
  };
}

/**
 * Generate all red alert achievements, ordered by distance (mixed imperial/metric)
 */
export const RED_ALERT_ACHIEVEMENTS: Achievement[] = (() => {
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
    createRedAlertAchievement(distance, isImperial)
  );
})();

/**
 * Convert scores to numeric values for Red Alert checking (includes misses as 0)
 * Unlike the general convertToValues, this preserves all arrows including misses
 */
function convertScoresForRedAlert(scores: any[], gameType: string): number[] {
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
 * Check if an end meets red alert criteria
 */
function isRedAlertEnd(end: any[], gameType: string, isImperial: boolean): boolean {
  if (!end || end.length === 0) {
    return false;
  }

  // Use Red Alert-specific conversion that includes misses as 0s
  const numericScores = convertScoresForRedAlert(end, gameType);

  if (isImperial) {
    // Imperial: all scores must be 7
    return numericScores.every(score => score === 7);
  } else {
    // Metric: all scores must be 7 or 8 (can be mixed)
    return numericScores.every(score => score === 7 || score === 8);
  }
}

/**
 * Check if this distance can award red alert based on round configuration
 */
function canAwardRedAlertAtDistance(roundName: string, targetDistance: number): { canAward: boolean; isImperial: boolean } {
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
 * Check for red alert end at a specific distance using domain functions
 */
function hasRedAlertEndAtDistance(scores: any[], gameType: string, targetDistance: number): boolean {
  if (!scores || scores.length === 0) {
    return false;
  }

  const { canAward, isImperial } = canAwardRedAlertAtDistance(gameType, targetDistance);
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

  // Check all ends at this distance for red alert patterns
  for (const endPair of targetDistanceRound.roundBreakdown) {
    if (endPair.firstEnd && isRedAlertEnd(endPair.firstEnd, gameType, isImperial)) {
      return true;
    }
    if (endPair.secondEnd && isRedAlertEnd(endPair.secondEnd, gameType, isImperial)) {
      return true;
    }
  }

  return false;
}

/**
 * Higher-order function to create the achievement check function for a specific distance
 */
function createRedAlertCheckFunction(distance: Distance, isImperial: boolean) {
  return function checkRedAlertAtDistanceAchieved(context: AchievementContext): AchievementProgress {
    // First check if we've already achieved this
    const existingAchievement = findExistingRedAlertAchievement(context, distance, isImperial);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check historical shoots
    const historicalProgress = checkRedAlertInHistory(context, distance, isImperial);
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
 * Check for existing red alert achievement in history
 */
function findExistingRedAlertAchievement(
  context: AchievementContext, 
  distance: Distance, 
  isImperial: boolean
): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && hasRedAlertEndAtDistance(historyItem.scores, historyItem.gameType, distance)) {
      const { canAward, isImperial: roundIsImperial } = canAwardRedAlertAtDistance(historyItem.gameType, distance);
      
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
 * Check current shoot for red alert achievement
 */
function checkRedAlertInCurrentShoot(
  context: AchievementContext, 
  distance: Distance, 
  isImperial: boolean
): AchievementProgress {
  const { currentShoot } = context;
  
  // Check if current shoot has red alert end at this distance
  if (!currentShoot.gameType || !hasRedAlertEndAtDistance(currentShoot.scores, currentShoot.gameType, distance)) {
    return {
      isUnlocked: false
    };
  }

  const { canAward, isImperial: roundIsImperial } = canAwardRedAlertAtDistance(currentShoot.gameType, distance);
  
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
 * Check history for red alert achievement
 */
function checkRedAlertInHistory(
  context: AchievementContext, 
  distance: Distance, 
  isImperial: boolean
): AchievementProgress {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && hasRedAlertEndAtDistance(historyItem.scores, historyItem.gameType, distance)) {
      const { canAward, isImperial: roundIsImperial } = canAwardRedAlertAtDistance(historyItem.gameType, distance);
      
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
export const checkRedAlertAt20ydAchieved = createRedAlertCheckFunction(20, true);
export const checkRedAlertAt30ydAchieved = createRedAlertCheckFunction(30, true);
export const checkRedAlertAt40ydAchieved = createRedAlertCheckFunction(40, true);
export const checkRedAlertAt50ydAchieved = createRedAlertCheckFunction(50, true);
export const checkRedAlertAt60ydAchieved = createRedAlertCheckFunction(60, true);
export const checkRedAlertAt80ydAchieved = createRedAlertCheckFunction(80, true);
export const checkRedAlertAt100ydAchieved = createRedAlertCheckFunction(100, true);

export const checkRedAlertAt20mAchieved = createRedAlertCheckFunction(20, false);
export const checkRedAlertAt30mAchieved = createRedAlertCheckFunction(30, false);
export const checkRedAlertAt40mAchieved = createRedAlertCheckFunction(40, false);
export const checkRedAlertAt50mAchieved = createRedAlertCheckFunction(50, false);
export const checkRedAlertAt60mAchieved = createRedAlertCheckFunction(60, false);
export const checkRedAlertAt70mAchieved = createRedAlertCheckFunction(70, false);
export const checkRedAlertAt90mAchieved = createRedAlertCheckFunction(90, false);

/**
 * Map of achievement IDs to their check functions
 */
export const RED_ALERT_CHECK_FUNCTIONS = {
  'red_alert_at_20yd': checkRedAlertAt20ydAchieved,
  'red_alert_at_30yd': checkRedAlertAt30ydAchieved,
  'red_alert_at_40yd': checkRedAlertAt40ydAchieved,
  'red_alert_at_50yd': checkRedAlertAt50ydAchieved,
  'red_alert_at_60yd': checkRedAlertAt60ydAchieved,
  'red_alert_at_80yd': checkRedAlertAt80ydAchieved,
  'red_alert_at_100yd': checkRedAlertAt100ydAchieved,
  'red_alert_at_20m': checkRedAlertAt20mAchieved,
  'red_alert_at_30m': checkRedAlertAt30mAchieved,
  'red_alert_at_40m': checkRedAlertAt40mAchieved,
  'red_alert_at_50m': checkRedAlertAt50mAchieved,
  'red_alert_at_60m': checkRedAlertAt60mAchieved,
  'red_alert_at_70m': checkRedAlertAt70mAchieved,
  'red_alert_at_90m': checkRedAlertAt90mAchieved,
} as const;