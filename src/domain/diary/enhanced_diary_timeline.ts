/**
 * Enhanced diary timeline service for generating rich timeline events
 * Combines existing notes/achievements with new venue detection and PB tracking
 */

import type { HistoryItem } from '../repositories/player_history.js';
import type { DiaryAchievement, DiaryTimelineItem } from '../achievements/diary_achievements.js';
import type { LocationData } from '../ports/location.js';

export interface NewVenueEvent {
  type: 'new-venue';
  date: string;
  shootId: number | string;
  location: LocationData;
  isFirstEver: boolean; // true if this is their first recorded location
}

export interface PersonalBestEvent {
  type: 'personal-best';
  date: string;
  shootId: number | string;
  gameType: string;
  score: number;
  previousBest?: number; // undefined if this is first time shooting this round
  isFirstTimeRound: boolean;
}

export interface FirstTimeRoundEvent {
  type: 'first-time-round';
  date: string;
  shootId: number | string;
  gameType: string;
  score: number;
}

export type EnhancedTimelineItem = 
  | DiaryTimelineItem 
  | (NewVenueEvent & { shoot: HistoryItem })
  | (PersonalBestEvent & { shoot: HistoryItem })
  | (FirstTimeRoundEvent & { shoot: HistoryItem });

/**
 * Detect new venues by comparing locations across shoot history
 */
export function detectNewVenues(shootHistory: HistoryItem[]): NewVenueEvent[] {
  const events: NewVenueEvent[] = [];
  const seenLocations = new Set<string>();
  
  // Sort by date (oldest first) to detect venues chronologically
  const chronologicalHistory = [...shootHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (const shoot of chronologicalHistory) {
    if (!shoot.location?.placeName) continue;
    
    const locationKey = shoot.location.placeName.toLowerCase().trim();
    
    if (!seenLocations.has(locationKey)) {
      seenLocations.add(locationKey);
      
      events.push({
        type: 'new-venue',
        date: shoot.date,
        shootId: shoot.id,
        location: shoot.location,
        isFirstEver: seenLocations.size === 1
      });
    }
  }
  
  return events;
}

/**
 * Detect personal bests and first-time rounds
 * Uses chronological order to properly track progression
 */
export function detectPersonalBests(shootHistory: HistoryItem[]): (PersonalBestEvent | FirstTimeRoundEvent)[] {
  const events: (PersonalBestEvent | FirstTimeRoundEvent)[] = [];
  const roundHistory = new Map<string, { bestScore: number; shootId: number | string; date: string }>();
  
  // Sort by date (oldest first) to track progression
  const chronologicalHistory = [...shootHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (const shoot of chronologicalHistory) {
    // Skip practice rounds
    if (shoot.gameType.toLowerCase().includes('practice')) continue;
    
    const gameTypeKey = shoot.gameType.toLowerCase();
    const currentRecord = roundHistory.get(gameTypeKey);
    
    if (!currentRecord) {
      // First time shooting this round
      roundHistory.set(gameTypeKey, {
        bestScore: shoot.score,
        shootId: shoot.id,
        date: shoot.date
      });
      
      events.push({
        type: 'first-time-round',
        date: shoot.date,
        shootId: shoot.id,
        gameType: shoot.gameType,
        score: shoot.score
      });
    } else if (shoot.score > currentRecord.bestScore) {
      // New personal best
      events.push({
        type: 'personal-best',
        date: shoot.date,
        shootId: shoot.id,
        gameType: shoot.gameType,
        score: shoot.score,
        previousBest: currentRecord.bestScore,
        isFirstTimeRound: false
      });
      
      // Update the record
      roundHistory.set(gameTypeKey, {
        bestScore: shoot.score,
        shootId: shoot.id,
        date: shoot.date
      });
    }
  }
  
  return events;
}

/**
 * Create enhanced timeline combining all event types
 */
export function createEnhancedDiaryTimeline(
  shootsWithNotes: HistoryItem[],
  diaryAchievements: DiaryAchievement[],
  allShootHistory: HistoryItem[]
): EnhancedTimelineItem[] {
  const timeline: EnhancedTimelineItem[] = [];
  
  // Add existing note entries
  shootsWithNotes.forEach(shoot => {
    timeline.push({
      type: 'note',
      date: shoot.date,
      shootId: shoot.id,
      shoot
    });
  });
  
  // Add existing achievement entries  
  diaryAchievements.forEach(achievement => {
    timeline.push({
      type: 'achievement',
      date: achievement.achievedDate,
      achievement
    });
  });
  
  // Add new venue events
  const venueEvents = detectNewVenues(allShootHistory);
  venueEvents.forEach(event => {
    const shoot = allShootHistory.find(s => s.id === event.shootId);
    if (shoot) {
      timeline.push({
        ...event,
        shoot
      });
    }
  });
  
  // Add personal best and first-time round events
  const pbEvents = detectPersonalBests(allShootHistory);
  pbEvents.forEach(event => {
    const shoot = allShootHistory.find(s => s.id === event.shootId);
    if (shoot) {
      timeline.push({
        ...event,
        shoot
      });
    }
  });
  
  // Sort by date (most recent first)
  return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Check if two locations are considered the same venue
 * Uses placeName for primary matching, with coordinate-based fallback
 */
export function isSameVenue(loc1: LocationData, loc2: LocationData): boolean {
  // Primary: match by place name if both have one
  if (loc1.placeName && loc2.placeName) {
    return loc1.placeName.toLowerCase().trim() === loc2.placeName.toLowerCase().trim();
  }
  
  // Fallback: coordinate-based proximity (within ~100 meters)
  const latDiff = Math.abs(loc1.latitude - loc2.latitude);
  const lngDiff = Math.abs(loc1.longitude - loc2.longitude);
  const proximityThreshold = 0.001; // Roughly 100 meters
  
  return latDiff < proximityThreshold && lngDiff < proximityThreshold;
}