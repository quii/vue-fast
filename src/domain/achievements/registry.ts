/**
 * Achievement Registry
 * 
 * All available achievements in the system
 */

import type { Achievement } from './types.js';

export const TEN_THOUSAND_ARROWS: Achievement = {
  id: 'ten_thousand_arrows',
  name: '10k Club',
  description: 'Shoot 10,000 arrows in total',
  targetArrows: 10000
};

export const TWENTY_FIVE_THOUSAND_ARROWS: Achievement = {
  id: 'twenty_five_thousand_arrows',
  name: '25k Club',
  description: 'Shoot 25,000 arrows in total',
  targetArrows: 25000
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
  TEN_THOUSAND_ARROWS,
  TWENTY_FIVE_THOUSAND_ARROWS
];

export function getAchievementById(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(achievement => achievement.id === id);
}

export function getAllAchievements(): Achievement[] {
  return [...ALL_ACHIEVEMENTS];
}