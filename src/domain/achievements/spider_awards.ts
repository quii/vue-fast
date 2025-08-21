/**
 * Spider Awards Achievement System
 * 
 * Awards for scoring X's at specific outdoor metric distances
 * Only available on outdoor metric rounds (not indoor or imperial)
 */

import type { AchievementContext, AchievementProgress, Achievement } from './types';
import { roundConfigManager } from '../scoring/game_types';
import { SPIDER_AWARDS_GROUP } from './groups.js';

// Distance and tier mapping for spider awards
const SPIDER_DISTANCES = [30, 40, 50, 60, 70, 90] as const;
type SpiderDistance = typeof SPIDER_DISTANCES[number];

// Tier mapping based on distance
const DISTANCE_TIER_MAP = {
  30: 'bronze',
  40: 'silver',
  50: 'silver', 
  60: 'gold',
  70: 'gold',
  90: 'diamond'
} as const;

/**
 * Higher-order function to create a spider achievement for a specific distance
 */
function createSpiderAchievement(distance: SpiderDistance): Achievement {
  const tier = DISTANCE_TIER_MAP[distance];
  
  return {
    id: `spider_at_${distance}m`,
    name: `X at ${distance}m`,
    tier: tier,
    targetScore: 1, // Just need 1 X
    group: SPIDER_AWARDS_GROUP
  };
}

/**
 * Generate all spider achievements for metric distances
 */
export const SPIDER_ACHIEVEMENTS: Achievement[] = SPIDER_DISTANCES.map(createSpiderAchievement);

/**
 * Higher-order function to create the achievement check function for a specific distance
 */
function createSpiderCheckFunction(distance: SpiderDistance) {
  return function checkSpiderAtDistanceAchieved(context: AchievementContext): AchievementProgress {
    // Check current shoot first - it takes priority if it has an X
    const currentShootProgress = checkSpiderInCurrentShoot(context, distance);
    if (currentShootProgress.isUnlocked) {
      return currentShootProgress;
    }

    // Then check if we've already achieved this in history
    const existingAchievement = findExistingSpiderAchievement(context, distance);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Check historical shoots for best attempt (without X)
    const historicalProgress = checkSpiderInHistory(context, distance);

    // Return the best progress so far (current vs historical)
    return {
      currentScore: Math.max(currentShootProgress.currentScore || 0, historicalProgress.currentScore || 0),
      targetScore: 1,
      isUnlocked: false
    };
  };
}

/**
 * Check if this round can award spider achievements at a given distance
 */
function canAwardSpiderAtDistance(roundName: string, targetDistance: number): boolean {
  const config = roundConfigManager.getConfig(roundName);
  if (!config || config.isImperial || !config.isOutdoor) {
    return false; // Must be outdoor metric
  }

  // Check if X is in the valid scores for this round
  if (!config.scores.includes('X')) {
    return false;
  }

  // Get all distances for this round
  const distances: number[] = [];
  if (config.maxDistanceMetres) {
    // Handle both string and number formats
    const maxDistance = typeof config.maxDistanceMetres === 'string' 
      ? parseInt(config.maxDistanceMetres, 10) 
      : config.maxDistanceMetres;
    distances.push(maxDistance);
  }
  if (config.otherDistancesMetres) {
    // Handle both string and number formats in the array
    const otherDistances = config.otherDistancesMetres.map(d => 
      typeof d === 'string' ? parseInt(d, 10) : d
    );
    distances.push(...otherDistances);
  }

  // Check if the target distance is shot in this round
  return distances.includes(targetDistance);
}

/**
 * Calculate which arrows are shot at a specific distance in a round
 */
function getArrowsAtDistance(roundName: string, targetDistance: number): { startArrow: number; endArrow: number } | null {
  const config = roundConfigManager.getConfig(roundName);
  if (!config || !canAwardSpiderAtDistance(roundName, targetDistance)) {
    return null;
  }

  // Get all distances for this round
  const distances: number[] = [];
  if (config.maxDistanceMetres) {
    // Handle both string and number formats
    const maxDistance = typeof config.maxDistanceMetres === 'string' 
      ? parseInt(config.maxDistanceMetres, 10) 
      : config.maxDistanceMetres;
    distances.push(maxDistance);
  }
  if (config.otherDistancesMetres) {
    // Handle both string and number formats in the array
    const otherDistances = config.otherDistancesMetres.map(d => 
      typeof d === 'string' ? parseInt(d, 10) : d
    );
    distances.push(...otherDistances);
  }

  const distanceIndex = distances.indexOf(targetDistance);
  
  // For practice rounds, all arrows are at the single distance
  if (config.isPracticeRound && distanceIndex === 0) {
    return { startArrow: 0, endArrow: Number.MAX_SAFE_INTEGER }; // All arrows
  }
  
  const distancesRoundSizes = config.distancesRoundSizes || [];
  
  // Calculate the start arrow for this distance
  let arrowsSoFar = 0;
  for (let i = 0; i < distanceIndex; i++) {
    arrowsSoFar += (distancesRoundSizes[i] || 0) * 12; // 12 arrows per dozen
  }

  const startArrow = arrowsSoFar;
  const arrowsAtThisDistance = (distancesRoundSizes[distanceIndex] || 0) * 12;
  const endArrow = startArrow + arrowsAtThisDistance - 1;

  return { startArrow, endArrow };
}

/**
 * Check for existing spider achievement in history
 */
function findExistingSpiderAchievement(context: AchievementContext, distance: SpiderDistance): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAwardSpiderAtDistance(historyItem.gameType, distance)) {
      const arrowRange = getArrowsAtDistance(historyItem.gameType, distance);
      if (arrowRange) {
        const relevantScores = historyItem.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
        const xCount = countXScores(relevantScores);
        
        if (xCount > 0) {
          return {
            currentScore: xCount,
            targetScore: 1,
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
 * Check current shoot for spider achievement
 */
function checkSpiderInCurrentShoot(context: AchievementContext, distance: SpiderDistance): AchievementProgress {
  const { currentShoot } = context;
  
  // Check if current shoot is outdoor metric and has our target distance
  if (!currentShoot.gameType || !canAwardSpiderAtDistance(currentShoot.gameType, distance)) {
    return {
      currentScore: 0,
      targetScore: 1,
      isUnlocked: false
    };
  }

  const arrowRange = getArrowsAtDistance(currentShoot.gameType, distance);
  if (!arrowRange) {
    return {
      currentScore: 0,
      targetScore: 1,
      isUnlocked: false
    };
  }

  // Get scores for this distance
  const relevantScores = currentShoot.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
  const xCount = countXScores(relevantScores);

  return {
    currentScore: xCount,
    targetScore: 1,
    isUnlocked: xCount > 0,
    unlockedAt: xCount > 0 ? new Date().toISOString() : undefined,
    achievingShootId: xCount > 0 ? currentShoot.id : undefined,
    achievedDate: xCount > 0 ? currentShoot.date : undefined
  };
}

/**
 * Check history for spider achievement
 */
function checkSpiderInHistory(context: AchievementContext, distance: SpiderDistance): AchievementProgress {
  let bestXCount = 0;

  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && canAwardSpiderAtDistance(historyItem.gameType, distance)) {
      const arrowRange = getArrowsAtDistance(historyItem.gameType, distance);
      if (arrowRange) {
        const relevantScores = historyItem.scores.slice(arrowRange.startArrow, arrowRange.endArrow + 1);
        const xCount = countXScores(relevantScores);
        bestXCount = Math.max(bestXCount, xCount);
      }
    }
  }

  return {
    currentScore: bestXCount,
    targetScore: 1,
    isUnlocked: false
  };
}

/**
 * Count X scores from array of arrow values
 */
function countXScores(scores: any[]): number {
  if (!scores || scores.length === 0) {
    return 0;
  }

  return scores.reduce((count, score) => {
    if (score === 'X') {
      return count + 1;
    }
    return count;
  }, 0);
}

/**
 * Export individual check functions for each distance
 */
export const checkSpiderAt30mAchieved = createSpiderCheckFunction(30);
export const checkSpiderAt40mAchieved = createSpiderCheckFunction(40);
export const checkSpiderAt50mAchieved = createSpiderCheckFunction(50);
export const checkSpiderAt60mAchieved = createSpiderCheckFunction(60);
export const checkSpiderAt70mAchieved = createSpiderCheckFunction(70);
export const checkSpiderAt90mAchieved = createSpiderCheckFunction(90);

/**
 * Map of achievement IDs to their check functions
 */
export const SPIDER_CHECK_FUNCTIONS = {
  'spider_at_30m': checkSpiderAt30mAchieved,
  'spider_at_40m': checkSpiderAt40mAchieved,
  'spider_at_50m': checkSpiderAt50mAchieved,
  'spider_at_60m': checkSpiderAt60mAchieved,
  'spider_at_70m': checkSpiderAt70mAchieved,
  'spider_at_90m': checkSpiderAt90mAchieved,
} as const;