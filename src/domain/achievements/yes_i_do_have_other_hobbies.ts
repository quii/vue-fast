/**
 * Yes I do have other hobbies Achievement
 * 
 * Achievement: Record 20 shoots in one calendar month
 * Tier: Gold
 */

import type { Achievement, AchievementContext, AchievementProgress } from './types';
import type { HistoryItem } from '../repositories/player_history';
import { ARROW_COUNT_GROUP } from './groups.js';

// Achievement definition
export const YES_I_DO_HAVE_OTHER_HOBBIES_ACHIEVEMENT: Achievement = {
  id: 'yes_i_do_have_other_hobbies',
  name: 'Yes I do have other hobbies',
  description: 'Record 20 shoots in one calendar month',
  tier: 'diamond',
  targetArrows: 20, // Using targetArrows to represent 20 shoots
  group: ARROW_COUNT_GROUP
};

/**
 * Parse date string to get year and month key
 */
function getMonthKey(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Group shoots by calendar month and count shoots per month
 */
function groupShootsByMonth(history: HistoryItem[]): Map<string, HistoryItem[]> {
  const monthGroups = new Map<string, HistoryItem[]>();
  
  for (const shoot of history) {
    const monthKey = getMonthKey(shoot.date);
    
    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, []);
    }
    
    monthGroups.get(monthKey)!.push(shoot);
  }
  
  return monthGroups;
}

/**
 * Find the month with the most shoots and return details
 */
function findBestMonth(history: HistoryItem[]): {
  shootCount: number;
  monthKey: string;
  shoots: HistoryItem[];
} {
  if (history.length === 0) {
    return { shootCount: 0, monthKey: '', shoots: [] };
  }
  
  const monthGroups = groupShootsByMonth(history);
  let bestCount = 0;
  let bestMonthKey = '';
  let bestShoots: HistoryItem[] = [];
  
  for (const [monthKey, shoots] of monthGroups) {
    if (shoots.length > bestCount) {
      bestCount = shoots.length;
      bestMonthKey = monthKey;
      bestShoots = shoots;
    }
  }
  
  return { 
    shootCount: bestCount, 
    monthKey: bestMonthKey, 
    shoots: bestShoots 
  };
}

/**
 * Find the shoot that achieved the 20-shoot milestone in the best month
 */
function findAchievingShoot(shoots: HistoryItem[]): HistoryItem | undefined {
  if (shoots.length < 20) {
    return undefined;
  }
  
  // Sort shoots by date to find the 20th shoot chronologically
  const sortedShoots = [...shoots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return sortedShoots[19]; // 20th shoot (0-indexed)
}

/**
 * Check if "Yes I do have other hobbies" achievement is achieved
 */
export function checkYesIdoHaveOtherHobbiesAchieved(context: AchievementContext): AchievementProgress {
  const targetShoots = 20;
  
  // Find the best month performance from history
  const bestMonth = findBestMonth(context.shootHistory);
  const shootCount = bestMonth.shootCount;
  const isAchieved = shootCount >= targetShoots;
  
  let unlockedAt: string | undefined;
  let achievingShootId: number | string | undefined;
  
  if (isAchieved) {
    const achievingShoot = findAchievingShoot(bestMonth.shoots);
    if (achievingShoot) {
      unlockedAt = achievingShoot.date;
      achievingShootId = achievingShoot.id;
    }
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