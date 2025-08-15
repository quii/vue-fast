/**
 * Achievement Group Progress Calculations
 * 
 * Functions to calculate tier-based progress for achievement groups
 */

import type { AchievementTier } from './types.js';
import type { AchievementData } from './calculator.js';

export interface TierProgress {
  tier: AchievementTier;
  earned: number;
  total: number;
}

export interface GroupProgress {
  totalEarned: number;
  totalAchievements: number;
  tierProgress: TierProgress[];
}

/**
 * Calculate tier-based progress for a group of achievements
 */
export function calculateGroupProgress(achievements: AchievementData[]): GroupProgress {
  const tierCounts = new Map<AchievementTier, { earned: number; total: number }>();
  
  // Initialize all possible tiers
  const allTiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];
  allTiers.forEach(tier => {
    tierCounts.set(tier, { earned: 0, total: 0 });
  });
  
  // Count achievements by tier
  achievements.forEach(achievement => {
    const tier = achievement.tier as AchievementTier;
    const counts = tierCounts.get(tier);
    if (counts) {
      counts.total += 1;
      if (achievement.progress.isUnlocked) {
        counts.earned += 1;
      }
    }
  });
  
  // Convert to array format, filtering out tiers with no achievements
  const tierProgress: TierProgress[] = allTiers
    .map(tier => {
      const counts = tierCounts.get(tier)!;
      return {
        tier,
        earned: counts.earned,
        total: counts.total
      };
    })
    .filter(progress => progress.total > 0); // Only include tiers that have achievements
  
  // Calculate totals
  const totalEarned = achievements.filter(a => a.progress.isUnlocked).length;
  const totalAchievements = achievements.length;
  
  return {
    totalEarned,
    totalAchievements,
    tierProgress
  };
}
