/**
 * Simple achievement system types
 * 
 * Starting with just one achievement: shoot 10,000 arrows total
 */

// Achievement tier levels
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

// Achievement group information
export interface AchievementGroup {
  id: string;
  name: string;
  description: string;
  icon?: string; // Optional icon for the group
  order?: number; // Optional ordering for display
}

// Simple achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  targetArrows?: number; // For arrow-count achievements
  targetScore?: number; // For score-based achievements
  gameType?: string; // For round-specific achievements
  group?: AchievementGroup; // Optional grouping information
}

// Progress tracking for the achievement
export interface AchievementProgress {
  totalArrows?: number; // For arrow-count achievements
  targetArrows?: number; // For arrow-count achievements
  currentScore?: number; // For score-based achievements
  targetScore?: number; // For score-based achievements
  isUnlocked: boolean;
  unlockedAt?: string; // ISO date string
  achievingShootId?: number | string; // ID of the shoot that achieved this milestone
  achievedDate?: string; // Date when this achievement was unlocked (from achieving shoot)
}

// Context for checking achievements
export interface AchievementContext {
  // Use the existing HistoryItem type - all shoots come from history
  shootHistory: HistoryItem[];
}

// Import HistoryItem from the player history repository
import type { HistoryItem } from '../repositories/player_history';

/**
 * Ensures that the AchievementContext has chronologically sorted history
 * (oldest first), which is required for achievements to link to the first 
 * occurrence rather than the most recent.
 * 
 * This function should be used whenever creating an AchievementContext
 * from history that comes from sortedHistory() (which is reverse chronological).
 */
export function ensureChronologicalContext(context: AchievementContext): AchievementContext {
  return {
    ...context,
    shootHistory: [...context.shootHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  };
}