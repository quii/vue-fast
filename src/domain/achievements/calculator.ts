/**
 * Achievement Calculator
 * 
 * Domain function that takes context and returns all achievement data needed for rendering
 */

import type { AchievementContext } from './types.js';
import { getAllAchievements } from './registry.js';
import { check1kArrowsAchieved } from './one_thousand_arrows.js';
import { check10kArrowsAchieved } from './ten_thousand_arrows.js';
import { check25kArrowsAchieved } from './twenty_five_thousand_arrows.js';
import { checkAgincourtArrowsAchieved } from './agincourt_arrows.js';
import { TWO_FIFTY_TWO_CHECK_FUNCTIONS } from './two_fifty_two_awards.js';
import { GOLDEN_END_CHECK_FUNCTIONS } from './imperial_golden_end.js';
import { SEVEN_TWENTY_MASTERY_CHECK_FUNCTIONS } from './seven_twenty_mastery_recurve.js';
import { SPIDER_CHECK_FUNCTIONS } from './spider_awards.js';
import { FROSTBITE_CHECK_FUNCTIONS } from './frostbite.js';
import { YORKIE_CHECK_FUNCTIONS } from './yorkie_achievements.js';
import { RED_ALERT_CHECK_FUNCTIONS } from './red_alert.js';
import { DONT_BE_BLUE_CHECK_FUNCTIONS } from './dont_be_blue.js';
import { 
  checkOlympianEffortBronzeAchieved,
  checkOlympianEffortSilverAchieved,
  checkOlympianEffortGoldAchieved,
  checkOlympianEffortDiamondAchieved
} from './olympian_effort.js';

// Olympian Effort achievement check functions
const OLYMPIAN_EFFORT_CHECK_FUNCTIONS = {
  olympian_effort_bronze: checkOlympianEffortBronzeAchieved,
  olympian_effort_silver: checkOlympianEffortSilverAchieved,
  olympian_effort_gold: checkOlympianEffortGoldAchieved,
  olympian_effort_diamond: checkOlympianEffortDiamondAchieved
} as const;

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  tier: string;
  targetArrows?: number;
  targetScore?: number;
  gameType?: string;
  progress: {
    totalArrows?: number;
    targetArrows?: number;
    currentScore?: number;
    targetScore?: number;
    isUnlocked: boolean;
    unlockedAt?: string;
    achievingShootId?: number | string;
    achievedDate?: string;
  };
  progressPercentage: number;
}

export function calculateAchievements(context: AchievementContext): AchievementData[] {
  const allAchievements = getAllAchievements();
  
  return allAchievements.map(achievement => {
    let progress;
    let progressPercentage = 0;
    
    // Call the appropriate achievement function based on ID
    switch (achievement.id) {
      case 'one_thousand_arrows':
        progress = check1kArrowsAchieved(context);
        progressPercentage = Math.min((progress.totalArrows! / progress.targetArrows!) * 100, 100);
        break;
        
      case 'agincourt_arrows':
        progress = checkAgincourtArrowsAchieved(context);
        progressPercentage = Math.min((progress.totalArrows! / progress.targetArrows!) * 100, 100);
        break;
        
      case 'ten_thousand_arrows':
        progress = check10kArrowsAchieved(context);
        progressPercentage = Math.min((progress.totalArrows! / progress.targetArrows!) * 100, 100);
        break;
        
      case 'twenty_five_thousand_arrows':
        progress = check25kArrowsAchieved(context);
        progressPercentage = Math.min((progress.totalArrows! / progress.targetArrows!) * 100, 100);
        break;
        
      default:
        // Check if it's a 720 mastery achievement
        if (achievement.id in SEVEN_TWENTY_MASTERY_CHECK_FUNCTIONS) {
          const checkFunction = SEVEN_TWENTY_MASTERY_CHECK_FUNCTIONS[achievement.id as keyof typeof SEVEN_TWENTY_MASTERY_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore! / progress.targetScore!) * 100, 100);
        } else if (achievement.id in TWO_FIFTY_TWO_CHECK_FUNCTIONS) {
          const checkFunction = TWO_FIFTY_TWO_CHECK_FUNCTIONS[achievement.id as keyof typeof TWO_FIFTY_TWO_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore! / progress.targetScore!) * 100, 100);
        } else if (achievement.id in GOLDEN_END_CHECK_FUNCTIONS) {
          // Check if it's a golden end achievement
          const checkFunction = GOLDEN_END_CHECK_FUNCTIONS[achievement.id as keyof typeof GOLDEN_END_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore! / progress.targetScore!) * 100, 100);
        } else if (achievement.id in OLYMPIAN_EFFORT_CHECK_FUNCTIONS) {
          // Check if it's an Olympian Effort achievement
          const checkFunction = OLYMPIAN_EFFORT_CHECK_FUNCTIONS[achievement.id as keyof typeof OLYMPIAN_EFFORT_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.totalArrows! / progress.targetArrows!) * 100, 100);
        } else if (achievement.id in SPIDER_CHECK_FUNCTIONS) {
          // Check if it's a Spider achievement
          const checkFunction = SPIDER_CHECK_FUNCTIONS[achievement.id as keyof typeof SPIDER_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore! / progress.targetScore!) * 100, 100);
        } else if (achievement.id in FROSTBITE_CHECK_FUNCTIONS) {
          // Check if it's a Frostbite achievement
          const checkFunction = FROSTBITE_CHECK_FUNCTIONS[achievement.id as keyof typeof FROSTBITE_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore! / progress.targetScore!) * 100, 100);
        } else if (achievement.id in YORKIE_CHECK_FUNCTIONS) {
          // Check if it's a Yorkie achievement
          const checkFunction = YORKIE_CHECK_FUNCTIONS[achievement.id as keyof typeof YORKIE_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore! / progress.targetScore!) * 100, 100);
        } else if (achievement.id in RED_ALERT_CHECK_FUNCTIONS) {
          // Check if it's a Red Alert achievement
          const checkFunction = RED_ALERT_CHECK_FUNCTIONS[achievement.id as keyof typeof RED_ALERT_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : 0; // Red Alert is binary - either achieved or not
        } else if (achievement.id in DONT_BE_BLUE_CHECK_FUNCTIONS) {
          // Check if it's a Don't Be Blue achievement
          const checkFunction = DONT_BE_BLUE_CHECK_FUNCTIONS[achievement.id as keyof typeof DONT_BE_BLUE_CHECK_FUNCTIONS];
          progress = checkFunction(context);
          progressPercentage = progress.isUnlocked ? 100 : 0; // Don't Be Blue is binary - either achieved or not
        } else {
          // Default fallback for unknown achievements
          progress = { 
            totalArrows: 0, 
            targetArrows: achievement.targetArrows || 0, 
            isUnlocked: false 
          };
          progressPercentage = 0;
        }
        break;
    }

    return {
      ...achievement,
      progress,
      progressPercentage
    };
  });
}
