/**
 * Achievement Registry
 * 
 * All available achievements in the system
 */

import type { Achievement } from './types.js';

export const ONE_THOUSAND_ARROWS: Achievement = {
  id: 'one_thousand_arrows',
  name: '1k Club',
  description: 'Shoot 1,000 arrows in total',
  targetArrows: 1000
};

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

export const SIX_HUNDRED_AT_WA70: Achievement = {
  id: 'six_hundred_at_wa70',
  name: '600 at 720',
  description: 'Score 600 or more on a WA 70m round',
  targetScore: 600,
  gameType: 'wa 70m'
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
  ONE_THOUSAND_ARROWS,
  TEN_THOUSAND_ARROWS,
  TWENTY_FIVE_THOUSAND_ARROWS,
  SIX_HUNDRED_AT_WA70
];

export function getAchievementById(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(achievement => achievement.id === id);
}

export function getAllAchievements(): Achievement[] {
  return [...ALL_ACHIEVEMENTS];
}