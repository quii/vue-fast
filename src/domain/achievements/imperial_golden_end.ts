/**
 * Imperial Golden End Awards
 * 
 * Awards for scoring 6 9s (54 points) in a single end at specific imperial distances
 * Only available on imperial shoots.
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { IMPERIAL_GOLDEN_END_GROUP } from './groups.js';

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

    // Check current shoot if it's an imperial round
    const currentShootProgress = checkGoldenEndInCurrentShoot(context, distance);
    if (currentShootProgress.isUnlocked) {
      return currentShootProgress;
    }

    // Check historical shoots
    const historicalProgress = checkGoldenEndInHistory(context, distance);
    if (historicalProgress.isUnlocked) {
      return historicalProgress;
    }

    // Not achieved yet - return current best attempt
    return {
      currentScore: Math.max(currentShootProgress.currentScore || 0, historicalProgress.currentScore || 0),
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
 * Calculate which arrows are shot at a specific distance in a round
 */
function getArrowsAtDistance(roundName: string, targetDistance: number): { startArrow: number; endArrow: number } | null {
  const config = roundConfigManager.getConfig(roundName);
  if (!config || !config.isImperial) {
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

  // Find the index of our target distance
  const distanceIndex = distances.indexOf(targetDistance);
  if (distanceIndex === -1) {
    return null;
  }

  // Calculate arrow range for this distance
  const distancesRoundSizes = config.distancesRoundSizes || [];
  let startArrow = 0;
  
  for (let i = 0; i < distanceIndex; i++) {
    const dozensAtDistance = distancesRoundSizes[i] || 0;
    startArrow += dozensAtDistance * 12; // 12 arrows per dozen
  }
  
  const dozensAtTargetDistance = distancesRoundSizes[distanceIndex] || 0;
  const endArrow = startArrow + (dozensAtTargetDistance * 12) - 1;
  
  return { startArrow, endArrow };
}

/**
 * Check for existing golden end achievement in history
 */
function findExistingGoldenEndAchievement(context: AchievementContext, distance: ImperialDistance): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAwardGoldenEndAtDistance(historyItem.gameType, distance)) {
      const arrowRange = getArrowsAtDistance(historyItem.gameType, distance);
      if (arrowRange) {
        const relevantScores = historyItem.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
        const bestEndScore = findBestEndAtDistance(relevantScores);
        
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
  }
  return null;
}

/**
 * Check current shoot for golden end achievement
 */
function checkGoldenEndInCurrentShoot(context: AchievementContext, distance: ImperialDistance): AchievementProgress {
  const { currentShoot } = context;
  
  // Check if current shoot is imperial and has our target distance
  if (!currentShoot.gameType || !canAwardGoldenEndAtDistance(currentShoot.gameType, distance)) {
    return {
      currentScore: 0,
      targetScore: 54,
      isUnlocked: false
    };
  }

  const arrowRange = getArrowsAtDistance(currentShoot.gameType, distance);
  if (!arrowRange) {
    return {
      currentScore: 0,
      targetScore: 54,
      isUnlocked: false
    };
  }

  // Get scores for this distance
  const relevantScores = currentShoot.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
  const bestEndScore = findBestEndAtDistance(relevantScores);

  return {
    currentScore: bestEndScore,
    targetScore: 54,
    isUnlocked: bestEndScore >= 54,
    unlockedAt: bestEndScore >= 54 ? new Date().toISOString() : undefined,
    achievingShootId: bestEndScore >= 54 ? currentShoot.id : undefined,
    achievedDate: bestEndScore >= 54 ? currentShoot.date : undefined
  };
}

/**
 * Check history for best golden end attempt
 */
function checkGoldenEndInHistory(context: AchievementContext, distance: ImperialDistance): AchievementProgress {
  let bestEndScore = 0;

  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAwardGoldenEndAtDistance(historyItem.gameType, distance)) {
      const arrowRange = getArrowsAtDistance(historyItem.gameType, distance);
      if (arrowRange) {
        const relevantScores = historyItem.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
        const endScore = findBestEndAtDistance(relevantScores);
        bestEndScore = Math.max(bestEndScore, endScore);
      }
    }
  }

  return {
    currentScore: bestEndScore,
    targetScore: 54,
    isUnlocked: false
  };
}

/**
 * Find the best single end score from an array of arrow scores
 */
function findBestEndAtDistance(scores: any[]): number {
  if (!scores || scores.length === 0) {
    return 0;
  }

  const config = roundConfigManager.getConfig('default') || { endSize: 6 };
  const endSize = config.endSize || 6;
  
  let bestEndScore = 0;
  
  // Process scores in groups of endSize
  for (let i = 0; i <= scores.length - endSize; i += endSize) {
    const endScores = scores.slice(i, i + endSize);
    const endTotal = calculateEndScore(endScores);
    bestEndScore = Math.max(bestEndScore, endTotal);
  }
  
  return bestEndScore;
}

/**
 * Calculate score from array of arrow values for a single end
 */
function calculateEndScore(scores: any[]): number {
  return scores.reduce((total, score) => {
    if (typeof score === 'number' && score >= 0) {
      return total + score;
    } else if (score === 'X') {
      return total + 10; // X counts as 10 for scoring
    } else if (score === 'M' || score === null || score === undefined) {
      return total + 0; // Miss
    }
    return total;
  }, 0);
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
