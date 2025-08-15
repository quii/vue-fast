/**
 * Achievement Groups
 * 
 * Definitions for achievement groupings to organize related achievements
 */

import type { AchievementGroup } from './types.js';

export const ARROW_COUNT_GROUP: AchievementGroup = {
  id: 'arrow_count',
  name: 'Shoot Lots of Arrows',
  description: 'Practice makes improvement',
  order: 1
};

export const IMPERIAL_PRECISION_GROUP: AchievementGroup = {
  id: 'imperial_precision', 
  name: '252 Awards',
  description: 'Score 252+ in the first 3 dozen arrows at imperial distances',
  order: 2
};

export const IMPERIAL_GOLDEN_END_GROUP: AchievementGroup = {
  id: 'imperial_golden_end',
  name: 'Imperial Golden End',
  description: 'Score 6 9s (54 points) in a single end at imperial distances',
  order: 3
};

export const METRIC_EXCELLENCE_GROUP: AchievementGroup = {
  id: 'metric_excellence',
  name: '720 mastery (recurve)', 
  description: 'High scores on WA 70m rounds with recurve bow',
  order: 4
};

export const OLYMPIAN_EFFORT_GROUP: AchievementGroup = {
  id: 'olympian_effort',
  name: 'Olympian Effort',
  description: 'Shoot a high number of arrows within any 3-day period',
  order: 5
};
