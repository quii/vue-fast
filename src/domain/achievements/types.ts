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
}

// Context for checking achievements
export interface AchievementContext {
  currentShoot: {
    scores: any[];
    score?: number; // Total score of the shoot
    gameType?: string; // Type of round
  };
  
  // Use the existing HistoryItem type - we'll need the full data later
  shootHistory: HistoryItem[];
}

// Import HistoryItem from the player history repository
import type { HistoryItem } from '../repositories/player_history';