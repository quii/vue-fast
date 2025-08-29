/**
 * Olympian Effort Achievement System
 * 
 * Challenges archers to shoot a high number of arrows over 3 consecutive days
 * Awards based on cumulative arrow totals across 3-day periods
 */

import type { Achievement, AchievementContext, AchievementProgress } from './types';
import type { HistoryItem } from '../repositories/player_history';
import { OLYMPIAN_EFFORT_GROUP } from './groups.js';

// Achievement definitions with arrow thresholds per day
const OLYMPIAN_THRESHOLDS = {
  bronze: 70,   // 70 arrows/day × 3 days = 210 total
  silver: 125,  // 125 arrows/day × 3 days = 375 total  
  gold: 200,    // 200 arrows/day × 3 days = 600 total
  diamond: 300  // 300 arrows/day × 3 days = 900 total
} as const;

/**
 * Calculate total arrows for each tier over 3 days
 */
function getThreeDayTotal(arrowsPerDay: number): number {
  return arrowsPerDay * 3;
}

/**
 * Generate all Olympian Effort achievements
 */
export const OLYMPIAN_EFFORT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'olympian_effort_bronze',
    name: 'Olympian Effort Bronze',
    description: `Shoot ${getThreeDayTotal(OLYMPIAN_THRESHOLDS.bronze)} arrows within any 3-day period`,
    tier: 'bronze',
    targetArrows: getThreeDayTotal(OLYMPIAN_THRESHOLDS.bronze),
    group: OLYMPIAN_EFFORT_GROUP
  },
  {
    id: 'olympian_effort_silver', 
    name: 'Olympian Effort Silver',
    description: `Shoot ${getThreeDayTotal(OLYMPIAN_THRESHOLDS.silver)} arrows within any 3-day period`,
    tier: 'silver',
    targetArrows: getThreeDayTotal(OLYMPIAN_THRESHOLDS.silver),
    group: OLYMPIAN_EFFORT_GROUP
  },
  {
    id: 'olympian_effort_gold',
    name: 'Olympian Effort Gold', 
    description: `Shoot ${getThreeDayTotal(OLYMPIAN_THRESHOLDS.gold)} arrows within any 3-day period`,
    tier: 'gold',
    targetArrows: getThreeDayTotal(OLYMPIAN_THRESHOLDS.gold),
    group: OLYMPIAN_EFFORT_GROUP
  },
  {
    id: 'olympian_effort_diamond',
    name: 'Olympian Effort Diamond',
    description: `Shoot ${getThreeDayTotal(OLYMPIAN_THRESHOLDS.diamond)} arrows within any 3-day period`,
    tier: 'diamond', 
    targetArrows: getThreeDayTotal(OLYMPIAN_THRESHOLDS.diamond),
    group: OLYMPIAN_EFFORT_GROUP
  }
];

/**
 * Parse date string to Date object, handling various formats
 */
function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if two dates are consecutive days
 */
function isNextDay(date1: Date, date2: Date): boolean {
  const nextDay = new Date(date1);
  nextDay.setDate(nextDay.getDate() + 1);
  return isSameDay(nextDay, date2);
}

/**
 * Get arrow count for a specific date from history
 */
function getArrowsForDate(history: HistoryItem[], targetDate: Date): number {
  return history
    .filter(item => {
      const itemDate = parseDate(item.date);
      return isSameDay(itemDate, targetDate);
    })
    .reduce((total, item) => total + (item.scores?.length || 0), 0);
}

/**
 * Find all unique shooting dates in history, sorted chronologically
 */
function getShootingDates(history: HistoryItem[]): Date[] {
  const dateSet = new Set<string>();
  
  history.forEach(item => {
    const date = parseDate(item.date);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    dateSet.add(dateKey);
  });
  
  return Array.from(dateSet)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Find the highest arrow total within any 3-day period in history
 */
function findBestThreeDayTotal(history: HistoryItem[]): { total: number; dates: Date[] } {
  if (history.length === 0) {
    return { total: 0, dates: [] };
  }

  const shootingDates = getShootingDates(history);
  let bestTotal = 0;
  let bestDates: Date[] = [];
  
  // Always check single days first (a single day counts as a valid "3-day period")
  for (const date of shootingDates) {
    const arrows = getArrowsForDate(history, date);
    if (arrows > bestTotal) {
      bestTotal = arrows;
      bestDates = [date];
    }
  }
  
  // If we have exactly 2 unique shooting dates, check 2-day combinations
  if (shootingDates.length >= 2) {
    for (let i = 0; i <= shootingDates.length - 2; i++) {
      for (let j = i + 1; j <= shootingDates.length - 1; j++) {
        const date1 = shootingDates[i];
        const date2 = shootingDates[j];
        
        // Check if within 3-day period
        const daysDiff = Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 2) {
          const arrows1 = getArrowsForDate(history, date1);
          const arrows2 = getArrowsForDate(history, date2);
          const total = arrows1 + arrows2;
          
          if (total > bestTotal) {
            bestTotal = total;
            bestDates = [date1, date2];
          }
        }
      }
    }
  }
  
  // If we have 3 or more unique shooting dates, check all possible 3-day combinations
  if (shootingDates.length >= 3) {
    // Check every possible 3-day window (any 3 dates within a calendar span of 3 days)
    for (let i = 0; i <= shootingDates.length - 3; i++) {
      for (let j = i + 1; j <= shootingDates.length - 2; j++) {
        for (let k = j + 1; k <= shootingDates.length - 1; k++) {
          const date1 = shootingDates[i];
          const date2 = shootingDates[j]; 
          const date3 = shootingDates[k];
          
          // Check if these three dates fall within a 3-day span
          const daysDiff = Math.ceil((date3.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 2) { // 0, 1, or 2 days difference = within 3-day period
            const arrows1 = getArrowsForDate(history, date1);
            const arrows2 = getArrowsForDate(history, date2);
            const arrows3 = getArrowsForDate(history, date3);
            const total = arrows1 + arrows2 + arrows3;
            
            if (total > bestTotal) {
              bestTotal = total;
              bestDates = [date1, date2, date3];
            }
          }
        }
      }
    }
  }
  
  return { total: bestTotal, dates: bestDates };
}

/**
 * Check if current shoot contributes to a new 3-day total
 */
function checkCurrentShootContribution(context: AchievementContext): { total: number; dates: Date[] } {
  if (!context.currentShoot || !context.currentShoot.scores?.length) {
    return { total: 0, dates: [] };
  }
  
  const currentArrows = context.currentShoot.scores.length;
  const today = new Date();
  
  // Create a combined history that includes today's shoot
  const todayItem: HistoryItem = {
    id: 'current',
    date: today.toISOString().split('T')[0],
    scores: context.currentShoot.scores,
    gameType: context.currentShoot.gameType || 'unknown',
    score: context.currentShoot.scores.reduce((sum, score) => {
      const numScore = typeof score === 'number' ? score : (score === 'X' ? 10 : 0);
      return sum + numScore;
    }, 0)
  };
  
  const combinedHistory = [...context.shootHistory, todayItem];
  
  // Find the best 3-day total including today's contribution
  const result = findBestThreeDayTotal(combinedHistory);
  
  return result;
}

/**
 * Get the overall best 3-day arrow total including current shoot
 */
function getBestThreeDayTotal(context: AchievementContext): { total: number; dates: Date[] } {
  // Get best from history (which should include today's shoots)
  const historyBest = findBestThreeDayTotal(context.shootHistory);
  
  // If current shoot has arrows and might add to today's total, check that too
  if (context.currentShoot && context.currentShoot.scores?.length) {
    const currentBest = checkCurrentShootContribution(context);
    // Return the higher total
    return currentBest.total > historyBest.total ? currentBest : historyBest;
  }
  
  return historyBest;
}

/**
 * Generic function to check Olympian Effort achievements
 */
function checkOlympianEffortAchievement(
  context: AchievementContext,
  tier: keyof typeof OLYMPIAN_THRESHOLDS
): AchievementProgress {
  const targetArrows = getThreeDayTotal(OLYMPIAN_THRESHOLDS[tier]);
  const bestResult = getBestThreeDayTotal(context);
  
  return {
    totalArrows: bestResult.total,
    targetArrows: targetArrows,
    isUnlocked: bestResult.total >= targetArrows,
    unlockedAt: bestResult.total >= targetArrows && bestResult.dates.length > 0
      ? bestResult.dates[bestResult.dates.length - 1].toISOString().split('T')[0]
      : undefined
  };
}

// Export individual achievement check functions
export function checkOlympianEffortBronzeAchieved(context: AchievementContext): AchievementProgress {
  return checkOlympianEffortAchievement(context, 'bronze');
}

export function checkOlympianEffortSilverAchieved(context: AchievementContext): AchievementProgress {
  return checkOlympianEffortAchievement(context, 'silver');
}

export function checkOlympianEffortGoldAchieved(context: AchievementContext): AchievementProgress {
  return checkOlympianEffortAchievement(context, 'gold');
}

export function checkOlympianEffortDiamondAchieved(context: AchievementContext): AchievementProgress {
  return checkOlympianEffortAchievement(context, 'diamond');
}
