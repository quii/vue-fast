/**
 * Simple achievement system types
 * 
 * Starting with just one achievement: shoot 10,000 arrows total
 */

// Simple achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  targetArrows: number;
}

// Progress tracking for the achievement
export interface AchievementProgress {
  totalArrows: number;
  targetArrows: number;
  isUnlocked: boolean;
  unlockedAt?: string; // ISO date string
}

// Context for checking achievements
export interface AchievementContext {
  currentShoot: {
    scores: any[];
  };
  
  shootHistory: Array<{
    scores: any[];
  }>;
}