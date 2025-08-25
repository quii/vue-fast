/**
 * Deliberate practice Achievement
 * 
 * Achievement: Shoot the same round, 3 times in one week (any 7 consecutive days)
 * Tier: Diamond
 */

import type { Achievement, AchievementContext, AchievementProgress } from './types';
import type { HistoryItem } from '../repositories/player_history';
import { ARROW_COUNT_GROUP } from './groups.js';

// Achievement definition
export const DELIBERATE_PRACTICE_ACHIEVEMENT: Achievement = {
  id: 'deliberate_practice',
  name: 'Deliberate practice',
  description: 'Shoot the same round, 3 times in one week',
  tier: 'diamond',
  targetArrows: 3, // Using targetArrows to represent 3 shoots
  group: ARROW_COUNT_GROUP
};

/**
 * Normalize round type for case-insensitive comparison
 */
function normalizeRoundType(gameType: string): string {
  return gameType.toLowerCase().trim();
}

/**
 * Parse date string to Date object
 */
function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if date2 is within 7 days after date1 (inclusive)
 */
function isWithinSevenDays(date1: Date, date2: Date): boolean {
  const daysDiff = Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff >= 0 && daysDiff <= 6; // 0 to 6 days difference = within 7-day window
}

/**
 * Group shoots by normalized round type
 */
function groupShootsByRoundType(history: HistoryItem[]): Map<string, HistoryItem[]> {
  const roundGroups = new Map<string, HistoryItem[]>();
  
  for (const shoot of history) {
    const normalizedRound = normalizeRoundType(shoot.gameType);
    
    if (!roundGroups.has(normalizedRound)) {
      roundGroups.set(normalizedRound, []);
    }
    
    roundGroups.get(normalizedRound)!.push(shoot);
  }
  
  return roundGroups;
}

/**
 * Find the best 7-day window for a specific round type
 * Returns { count, achievingShoot } where achievingShoot is the 3rd shoot if achieved
 */
function findBestSevenDayWindow(shoots: HistoryItem[]): {
  count: number;
  achievingShoot?: HistoryItem;
} {
  if (shoots.length < 3) {
    return { count: shoots.length };
  }
  
  // Sort shoots by date to process chronologically
  const sortedShoots = [...shoots].sort((a, b) => 
    parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );
  
  let maxCount = 0;
  let achievingShoot: HistoryItem | undefined;
  
  // For each starting shoot, count how many shoots are within 7 days
  for (let i = 0; i < sortedShoots.length; i++) {
    const startDate = parseDate(sortedShoots[i].date);
    let count = 1; // Include the starting shoot
    let potentialAchievingShoot: HistoryItem | undefined;
    
    // Count shoots within 7 days of the start date
    for (let j = i + 1; j < sortedShoots.length; j++) {
      const currentDate = parseDate(sortedShoots[j].date);
      
      if (isWithinSevenDays(startDate, currentDate)) {
        count++;
        
        // If this is the 3rd shoot and we haven't achieved yet, this is our achieving shoot
        if (count === 3 && !achievingShoot) {
          potentialAchievingShoot = sortedShoots[j];
        }
      } else {
        break; // No more shoots within the 7-day window
      }
    }
    
    // Update max count and achieving shoot if this window is better
    if (count > maxCount) {
      maxCount = count;
      achievingShoot = potentialAchievingShoot;
    }
    
    // Early exit if we've achieved the target
    if (maxCount >= 3 && achievingShoot) {
      break;
    }
  }
  
  return { count: maxCount, achievingShoot };
}

/**
 * Find the round type with the best 7-day performance across all rounds
 */
function findBestRoundPerformance(history: HistoryItem[]): {
  count: number;
  roundType: string;
  achievingShoot?: HistoryItem;
} {
  if (history.length === 0) {
    return { count: 0, roundType: '' };
  }
  
  const roundGroups = groupShootsByRoundType(history);
  let bestCount = 0;
  let bestRoundType = '';
  let bestAchievingShoot: HistoryItem | undefined;
  
  // Check each round type for their best 7-day window
  for (const [roundType, shoots] of roundGroups) {
    const result = findBestSevenDayWindow(shoots);
    
    if (result.count > bestCount) {
      bestCount = result.count;
      bestRoundType = roundType;
      bestAchievingShoot = result.achievingShoot;
    }
  }
  
  return { 
    count: bestCount, 
    roundType: bestRoundType, 
    achievingShoot: bestAchievingShoot 
  };
}

/**
 * Check if "Deliberate practice" achievement is achieved
 */
export function checkDeliberatePracticeAchieved(context: AchievementContext): AchievementProgress {
  const targetShoots = 3;
  
  // Find the best round performance from history
  const bestPerformance = findBestRoundPerformance(context.shootHistory);
  const shootCount = bestPerformance.count;
  const isAchieved = shootCount >= targetShoots;
  
  let unlockedAt: string | undefined;
  let achievingShootId: number | string | undefined;
  
  if (isAchieved && bestPerformance.achievingShoot) {
    unlockedAt = bestPerformance.achievingShoot.date;
    achievingShootId = bestPerformance.achievingShoot.id;
  }
  
  return {
    totalArrows: shootCount, // Using totalArrows to represent shoot count
    targetArrows: targetShoots,
    isUnlocked: isAchieved,
    unlockedAt,
    achievingShootId,
    achievedDate: unlockedAt
  };
}