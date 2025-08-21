/**
 * 252 Awards for Imperial Distances
 * 
 * Awards for scoring 252 or more in the first 3 dozen arrows at specific distances
 * Only available on imperial shoots.
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { IMPERIAL_PRECISION_GROUP } from './groups.js';

// Imperial distances for 252 awards
const IMPERIAL_DISTANCES = [10, 20, 30, 40, 50, 60, 80, 100] as const;
type ImperialDistance = typeof IMPERIAL_DISTANCES[number];

/**
 * Higher-order function to create a 252 achievement for a specific distance
 */
function create252Achievement(distance: ImperialDistance): Achievement {
  // Determine tier based on distance
  let tier: string;
  if (distance === 20 || distance === 30) {
    tier = 'bronze';
  } else if (distance === 40 || distance === 50) {
    tier = 'silver';
  } else if (distance === 60 || distance === 80) {
    tier = 'gold';
  } else if (distance === 100) {
    tier = 'diamond';
  } else {
    // Default for 10yd (keeping as bronze)
    tier = 'bronze';
  }

  return {
    id: `two_fifty_two_at_${distance}yd`,
    name: `252 at ${distance}yd`,
    tier: tier as any,
    targetScore: 252,
    group: IMPERIAL_PRECISION_GROUP
    // No gameType field - the achievement name already indicates the distance
  };
}

/**
 * Generate all 252 achievements for imperial distances
 */
export const TWO_FIFTY_TWO_ACHIEVEMENTS: Achievement[] = IMPERIAL_DISTANCES.map(create252Achievement);

/**
 * Higher-order function to create the achievement check function for a specific distance
 */
function create252CheckFunction(distance: ImperialDistance) {
  return function check252AtDistanceAchieved(context: AchievementContext): AchievementProgress {
    // First check if we've already achieved this
    const existingAchievement = findExisting252Achievement(context, distance);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check current shoot if it's an imperial round
    const currentShootProgress = check252InCurrentShoot(context, distance);
    if (currentShootProgress.isUnlocked) {
      return currentShootProgress;
    }

    // Check historical shoots
    const historicalProgress = check252InHistory(context, distance);
    if (historicalProgress.isUnlocked) {
      return historicalProgress;
    }

    // Not achieved yet - return current best attempt
    return {
      currentScore: Math.max(currentShootProgress.currentScore || 0, historicalProgress.currentScore || 0),
      targetScore: 252,
      isUnlocked: false
    };
  };
}

/**
 * Check if this distance can award 252 based on round configuration
 */
function canAward252AtDistance(roundName: string, targetDistance: number): boolean {
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

  // Find the index of our target distance
  const distanceIndex = distances.indexOf(targetDistance);
  if (distanceIndex === -1) {
    return false; // This distance is not shot in this round
  }

  // Check if we shoot at least 3 dozen (36 arrows) at this distance
  const distancesRoundSizes = config.distancesRoundSizes || [];
  const dozensAtDistance = distancesRoundSizes[distanceIndex] || 0;
  
  return dozensAtDistance >= 3; // Need at least 3 dozen arrows
}

/**
 * Calculate which arrows are shot at a specific distance in a round
 */
function getArrowsAtDistance(roundName: string, targetDistance: number): { startArrow: number; endArrow: number } | null {
  const config = roundConfigManager.getConfig(roundName);
  if (!config || !canAward252AtDistance(roundName, targetDistance)) {
    return null;
  }

  // Get all distances for this round
  const distances: number[] = [];
  if (config.maxDistanceYards) {
    distances.push(config.maxDistanceYards);
  }
  if (config.otherDistancesYards) {
    distances.push(...config.otherDistancesYards);
  }

  const distanceIndex = distances.indexOf(targetDistance);
  const distancesRoundSizes = config.distancesRoundSizes || [];
  
  // Calculate the start arrow for this distance
  let arrowsSoFar = 0;
  for (let i = 0; i < distanceIndex; i++) {
    arrowsSoFar += (distancesRoundSizes[i] || 0) * 12;
  }

  const startArrow = arrowsSoFar;
  const arrowsAtThisDistance = Math.min((distancesRoundSizes[distanceIndex] || 0) * 12, 36); // Max 36 arrows for the award
  const endArrow = startArrow + arrowsAtThisDistance - 1;

  return { startArrow, endArrow };
}

/**
 * Check for existing 252 achievement in history
 */
function findExisting252Achievement(context: AchievementContext, distance: ImperialDistance): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAward252AtDistance(historyItem.gameType, distance)) {
      const arrowRange = getArrowsAtDistance(historyItem.gameType, distance);
      if (arrowRange) {
        const relevantScores = historyItem.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
        const scoreAtDistance = calculateScore(relevantScores, historyItem.gameType);
        
        if (scoreAtDistance >= 252) {
          return {
            currentScore: scoreAtDistance,
            targetScore: 252,
            isUnlocked: true,
            unlockedAt: historyItem.date,
            achievingShootId: historyItem.id,
            achievedDate: historyItem.date
          };
        }
      }
    }
  }
  return null;
}

/**
 * Check current shoot for 252 achievement
 */
function check252InCurrentShoot(context: AchievementContext, distance: ImperialDistance): AchievementProgress {
  const { currentShoot } = context;
  
  // Check if current shoot is imperial and has our target distance
  if (!currentShoot.gameType || !canAward252AtDistance(currentShoot.gameType, distance)) {
    return {
      currentScore: 0,
      targetScore: 252,
      isUnlocked: false
    };
  }

  const arrowRange = getArrowsAtDistance(currentShoot.gameType, distance);
  if (!arrowRange) {
    return {
      currentScore: 0,
      targetScore: 252,
      isUnlocked: false
    };
  }

  // Get scores for the first 3 dozen arrows at this distance
  const relevantScores = currentShoot.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
  const currentScore = calculateScore(relevantScores, currentShoot.gameType);

  return {
    currentScore,
    targetScore: 252,
    isUnlocked: currentScore >= 252,
    unlockedAt: currentScore >= 252 ? new Date().toISOString() : undefined,
    achievingShootId: currentScore >= 252 ? currentShoot.id : undefined,
    achievedDate: currentScore >= 252 ? currentShoot.date : undefined
  };
}

/**
 * Check history for best attempt at 252 achievement
 */
function check252InHistory(context: AchievementContext, distance: ImperialDistance): AchievementProgress {
  let bestScore = 0;

  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAward252AtDistance(historyItem.gameType, distance)) {
      const arrowRange = getArrowsAtDistance(historyItem.gameType, distance);
      if (arrowRange) {
        const relevantScores = historyItem.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
        const scoreAtDistance = calculateScore(relevantScores, historyItem.gameType);
        bestScore = Math.max(bestScore, scoreAtDistance);
      }
    }
  }

  return {
    currentScore: bestScore,
    targetScore: 252,
    isUnlocked: false
  };
}

/**
 * Calculate score from array of arrow values
 */
function calculateScore(scores: any[], gameType: string): number {
  if (!scores || scores.length === 0) {
    return 0;
  }

  return scores.reduce((total, score) => {
    if (score === 'M' || score === 'm' || score === null || score === undefined) {
      return total; // Miss = 0 points
    }
    
    // Handle numeric scores and X values
    const numericScore = typeof score === 'number' ? score : parseInt(score, 10);
    return total + (isNaN(numericScore) ? 0 : numericScore);
  }, 0);
}

/**
 * Export individual check functions for each distance
 */
export const check252At10ydAchieved = create252CheckFunction(10);
export const check252At20ydAchieved = create252CheckFunction(20);
export const check252At30ydAchieved = create252CheckFunction(30);
export const check252At40ydAchieved = create252CheckFunction(40);
export const check252At50ydAchieved = create252CheckFunction(50);
export const check252At60ydAchieved = create252CheckFunction(60);
export const check252At80ydAchieved = create252CheckFunction(80);
export const check252At100ydAchieved = create252CheckFunction(100);

/**
 * Map of achievement IDs to their check functions
 */
export const TWO_FIFTY_TWO_CHECK_FUNCTIONS = {
  'two_fifty_two_at_10yd': check252At10ydAchieved,
  'two_fifty_two_at_20yd': check252At20ydAchieved,
  'two_fifty_two_at_30yd': check252At30ydAchieved,
  'two_fifty_two_at_40yd': check252At40ydAchieved,
  'two_fifty_two_at_50yd': check252At50ydAchieved,
  'two_fifty_two_at_60yd': check252At60ydAchieved,
  'two_fifty_two_at_80yd': check252At80ydAchieved,
  'two_fifty_two_at_100yd': check252At100ydAchieved,
} as const;
