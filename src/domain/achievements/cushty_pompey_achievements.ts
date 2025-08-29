/**
 * Cushty Pompey! Achievement Group
 * 
 * Achievements for scoring specific thresholds on Portsmouth rounds
 * Based on the UK Portsmouth badge scheme
 */

import type { Achievement, AchievementContext, AchievementProgress } from './types.js'
import { CUSHTY_POMPEY_GROUP } from './groups.js'

// Portsmouth score thresholds based on UK badge scheme
const PORTSMOUTH_THRESHOLDS = [300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 580, 585, 590, 595, 600] as const;
type PortsmouthThreshold = typeof PORTSMOUTH_THRESHOLDS[number];

// Tier mapping based on score ranges
function getTierForScore(score: PortsmouthThreshold): string {
  if (score <= 350) return 'bronze';
  if (score <= 450) return 'silver';
  if (score <= 550) return 'gold';
  return 'diamond';
}

/**
 * Higher-order function to create a Portsmouth achievement for a specific score threshold
 */
function createPortsmouthAchievement(targetScore: PortsmouthThreshold): Achievement {
  const tier = getTierForScore(targetScore);
  
  return {
    id: `cushty_pompey_${targetScore}`,
    name: `Cushty Pompey! (${targetScore})`,
    description: `Score ${targetScore} or more on a Portsmouth round`,
    tier: tier,
    targetScore: targetScore,
    gameType: 'portsmouth',
    group: CUSHTY_POMPEY_GROUP
  };
}

/**
 * Generate all Portsmouth achievements for the score thresholds
 */
export const CUSHTY_POMPEY_ACHIEVEMENTS: Achievement[] = PORTSMOUTH_THRESHOLDS.map(createPortsmouthAchievement);

/**
 * Higher-order function to create the achievement check function for a specific score threshold
 */
function createPortsmouthCheckFunction(targetScore: PortsmouthThreshold) {
  return function checkPortsmouthScoreAchieved(context: AchievementContext): AchievementProgress {
    // Check if we've already achieved this in history
    const existingAchievement = findExistingPortsmouthAchievement(context, targetScore);
    if (existingAchievement) {
      return existingAchievement;
    }

    // Not achieved yet - get best score for progress tracking
    const bestScore = getBestPortsmouthScore(context);
    
    return {
      currentScore: bestScore,
      targetScore: targetScore,
      isUnlocked: false
    };
  };
}


/**
 * Check for existing Portsmouth achievement in history
 */
function findExistingPortsmouthAchievement(context: AchievementContext, targetScore: PortsmouthThreshold): AchievementProgress | null {
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && historyItem.gameType.toLowerCase() === 'portsmouth') {
      // Calculate total score


      if (historyItem.score >= targetScore) {
        return {
          currentScore: historyItem.score,
          targetScore: targetScore,
          isUnlocked: true,
          unlockedAt: historyItem.date,
          achievingShootId: historyItem.id,
          achievedDate: historyItem.date
        }
      }
    }
  }
  return null;
}

/**
 * Get the best Portsmouth score from history for progress tracking
 */
function getBestPortsmouthScore(context: AchievementContext): number {
  let bestScore = 0;

  // Check history
  for (const historyItem of context.shootHistory) {
    if (historyItem.gameType && historyItem.gameType.toLowerCase() === 'portsmouth') {

      bestScore = Math.max(bestScore, historyItem.score);
    }
  }

  return bestScore;
}

/**
 * Export individual check functions for each score threshold
 */
export const checkCushtyPompey300Achieved = createPortsmouthCheckFunction(300);
export const checkCushtyPompey325Achieved = createPortsmouthCheckFunction(325);
export const checkCushtyPompey350Achieved = createPortsmouthCheckFunction(350);
export const checkCushtyPompey375Achieved = createPortsmouthCheckFunction(375);
export const checkCushtyPompey400Achieved = createPortsmouthCheckFunction(400);
export const checkCushtyPompey425Achieved = createPortsmouthCheckFunction(425);
export const checkCushtyPompey450Achieved = createPortsmouthCheckFunction(450);
export const checkCushtyPompey475Achieved = createPortsmouthCheckFunction(475);
export const checkCushtyPompey500Achieved = createPortsmouthCheckFunction(500);
export const checkCushtyPompey525Achieved = createPortsmouthCheckFunction(525);
export const checkCushtyPompey550Achieved = createPortsmouthCheckFunction(550);
export const checkCushtyPompey575Achieved = createPortsmouthCheckFunction(575);
export const checkCushtyPompey580Achieved = createPortsmouthCheckFunction(580);
export const checkCushtyPompey585Achieved = createPortsmouthCheckFunction(585);
export const checkCushtyPompey590Achieved = createPortsmouthCheckFunction(590);
export const checkCushtyPompey595Achieved = createPortsmouthCheckFunction(595);
export const checkCushtyPompey600Achieved = createPortsmouthCheckFunction(600);

/**
 * Map of achievement IDs to their check functions
 */
export const CUSHTY_POMPEY_CHECK_FUNCTIONS = {
  'cushty_pompey_300': checkCushtyPompey300Achieved,
  'cushty_pompey_325': checkCushtyPompey325Achieved,
  'cushty_pompey_350': checkCushtyPompey350Achieved,
  'cushty_pompey_375': checkCushtyPompey375Achieved,
  'cushty_pompey_400': checkCushtyPompey400Achieved,
  'cushty_pompey_425': checkCushtyPompey425Achieved,
  'cushty_pompey_450': checkCushtyPompey450Achieved,
  'cushty_pompey_475': checkCushtyPompey475Achieved,
  'cushty_pompey_500': checkCushtyPompey500Achieved,
  'cushty_pompey_525': checkCushtyPompey525Achieved,
  'cushty_pompey_550': checkCushtyPompey550Achieved,
  'cushty_pompey_575': checkCushtyPompey575Achieved,
  'cushty_pompey_580': checkCushtyPompey580Achieved,
  'cushty_pompey_585': checkCushtyPompey585Achieved,
  'cushty_pompey_590': checkCushtyPompey590Achieved,
  'cushty_pompey_595': checkCushtyPompey595Achieved,
  'cushty_pompey_600': checkCushtyPompey600Achieved
} as const;