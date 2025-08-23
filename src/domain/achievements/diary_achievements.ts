/**
 * Utility functions for integrating achievements into diary view
 */

import type { AchievementContext } from './types.js';
import { calculateAchievements, type AchievementData } from './calculator.js';
import type { HistoryItem } from '../repositories/player_history.js';

export interface DiaryAchievement {
  id: string;
  name: string;
  description: string;
  tier: string;
  achievedDate: string;
  achievingShootId: number | string;
  unlockedAt: string;
}

/**
 * Get all achievements that have been unlocked, with their achievement dates
 * This is used to create the diary timeline
 */
export function getDiaryAchievements(shootHistory: HistoryItem[]): DiaryAchievement[] {
  if (shootHistory.length === 0) return [];

  // Create context with all shoots to get current achievement state
  const context: AchievementContext = {
    currentShoot: {
      // Use the most recent shoot as current
      id: shootHistory[0]?.id,
      date: shootHistory[0]?.date,
      scores: shootHistory[0]?.scores || [],
      score: shootHistory[0]?.score,
      gameType: shootHistory[0]?.gameType,
      userProfile: shootHistory[0]?.userProfile
    },
    shootHistory
  };

  const allAchievements = calculateAchievements(context);
  
  return allAchievements
    .filter((achievement): achievement is AchievementData & { 
      progress: { 
        isUnlocked: true;
        achievingShootId: number | string;
        achievedDate: string;
        unlockedAt: string;
      } 
    } => 
      achievement.progress.isUnlocked && 
      achievement.progress.achievingShootId !== undefined &&
      achievement.progress.achievedDate !== undefined &&
      achievement.progress.unlockedAt !== undefined
    )
    .map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description || '',
      tier: achievement.tier,
      achievedDate: achievement.progress.achievedDate,
      achievingShootId: achievement.progress.achievingShootId,
      unlockedAt: achievement.progress.unlockedAt
    }))
    .sort((a, b) => new Date(a.unlockedAt).getTime() - new Date(b.unlockedAt).getTime());
}

/**
 * Create a chronological timeline of diary entries (notes and achievements)
 * Returns items sorted by date, with type indicators
 */
export interface DiaryTimelineItem {
  type: 'note' | 'achievement';
  date: string; // For sorting
  shootId?: number | string; // For notes, this links to the shoot
  achievement?: DiaryAchievement; // For achievements
  shoot?: HistoryItem; // For notes, the associated shoot
}

export function createDiaryTimeline(
  shootsWithNotes: HistoryItem[],
  diaryAchievements: DiaryAchievement[]
): DiaryTimelineItem[] {
  const timeline: DiaryTimelineItem[] = [];

  // Add note entries
  shootsWithNotes.forEach(shoot => {
    timeline.push({
      type: 'note',
      date: shoot.date,
      shootId: shoot.id,
      shoot
    });
  });

  // Add achievement entries
  diaryAchievements.forEach(achievement => {
    timeline.push({
      type: 'achievement',
      date: achievement.achievedDate, // Use achievedDate for sorting
      achievement
    });
  });

  // Sort by date (most recent first)
  return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}