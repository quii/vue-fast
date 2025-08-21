/**
 * Achievement Registry
 * 
 * All available achievements in the system
 */

import type { Achievement } from './types.js';
import { TWO_FIFTY_TWO_ACHIEVEMENTS } from './two_fifty_two_awards.js';
import { GOLDEN_END_ACHIEVEMENTS } from './imperial_golden_end.js';
import { OLYMPIAN_EFFORT_ACHIEVEMENTS } from './olympian_effort.js';
import { SEVEN_TWENTY_MASTERY_ACHIEVEMENTS } from './seven_twenty_mastery_recurve.js';
import { SPIDER_ACHIEVEMENTS } from './spider_awards.js';
import { FROSTBITE_ACHIEVEMENTS } from './frostbite.js';
import { YORKIE_ACHIEVEMENTS } from './yorkie_achievements.js';
import { ARROW_COUNT_GROUP, IMPERIAL_PRECISION_GROUP, IMPERIAL_GOLDEN_END_GROUP, METRIC_EXCELLENCE_GROUP, OLYMPIAN_EFFORT_GROUP, SPIDER_AWARDS_GROUP, FROSTBITE_GROUP } from './groups.js';

export const ONE_THOUSAND_ARROWS: Achievement = {
  id: 'one_thousand_arrows',
  name: '1k Club',
  description: 'Shoot 1,000 arrows in total',
  tier: 'bronze',
  targetArrows: 1000,
  group: ARROW_COUNT_GROUP
};

export const AGINCOURT_ARROWS: Achievement = {
  id: 'agincourt_arrows',
  name: 'Agincourt 1415',
  description: 'Shoot 1415 arrows',
  tier: 'bronze',
  targetArrows: 1415,
  group: ARROW_COUNT_GROUP
}

export const TEN_THOUSAND_ARROWS: Achievement = {
  id: 'ten_thousand_arrows',
  name: '10k Club',
  description: 'Shoot 10,000 arrows in total',
  tier: 'silver',
  targetArrows: 10000,
  group: ARROW_COUNT_GROUP
};

export const TWENTY_FIVE_THOUSAND_ARROWS: Achievement = {
  id: 'twenty_five_thousand_arrows',
  name: '25k Club',
  description: 'Shoot 25,000 arrows in total',
  tier: 'gold',
  targetArrows: 25000,
  group: ARROW_COUNT_GROUP
};

export const SIX_HUNDRED_AT_WA70: Achievement = {
  id: 'six_hundred_at_wa70',
  name: '600 at 720',
  description: 'Score 600 or more on a WA 70m round',
  tier: 'gold',
  targetScore: 600,
  gameType: 'wa 70m',
  group: METRIC_EXCELLENCE_GROUP
};

export const ALL_ACHIEVEMENTS: Achievement[] = [
  ONE_THOUSAND_ARROWS,
  AGINCOURT_ARROWS,
  TEN_THOUSAND_ARROWS,
  TWENTY_FIVE_THOUSAND_ARROWS,
  ...SEVEN_TWENTY_MASTERY_ACHIEVEMENTS,
  ...TWO_FIFTY_TWO_ACHIEVEMENTS,
  ...GOLDEN_END_ACHIEVEMENTS,
  ...OLYMPIAN_EFFORT_ACHIEVEMENTS,
  ...SPIDER_ACHIEVEMENTS,
  ...FROSTBITE_ACHIEVEMENTS,
  ...YORKIE_ACHIEVEMENTS
];

export function getAchievementById(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(achievement => achievement.id === id);
}

export function getAllAchievements(): Achievement[] {
  return [...ALL_ACHIEVEMENTS];
}