/**
 * Simple Achievement Registry
 * 
 * Just one achievement for now: shoot 10,000 arrows total
 */

import type { Achievement } from './types.js';

// The one and only achievement for now
export const TEN_THOUSAND_ARROWS: Achievement = {
  id: 'ten_thousand_arrows',
  name: '10k Club',
  description: 'Shoot 10,000 arrows in total',
  targetArrows: 10000
};

export function getAchievement(): Achievement {
  return TEN_THOUSAND_ARROWS;
}