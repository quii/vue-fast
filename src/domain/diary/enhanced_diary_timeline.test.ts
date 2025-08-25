import { describe, it, expect } from 'vitest';
import {
  detectNewVenues,
  detectPersonalBests,
  createEnhancedDiaryTimeline,
  isSameVenue
} from './enhanced_diary_timeline.js';
import type { HistoryItem } from '../repositories/player_history.js';
import type { DiaryAchievement } from '../achievements/diary_achievements.js';

describe('Enhanced Diary Timeline', () => {
  const createMockShoot = (
    id: number,
    date: string,
    gameType: string,
    score: number,
    location?: { placeName: string; latitude: number; longitude: number }
  ): HistoryItem => ({
    id,
    date,
    gameType,
    score,
    scores: [],
    location: location ? {
      placeName: location.placeName,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date(date).getTime()
    } : undefined
  });

  describe('detectNewVenues', () => {
    it('should detect first venue as new venue', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500, {
          placeName: 'Archery Club A',
          latitude: 51.5074,
          longitude: -0.1278
        })
      ];

      const venues = detectNewVenues(shoots);

      expect(venues).toHaveLength(1);
      expect(venues[0]).toEqual({
        type: 'new-venue',
        date: '2023-01-01',
        shootId: 1,
        location: expect.objectContaining({
          placeName: 'Archery Club A',
          latitude: 51.5074,
          longitude: -0.1278
        }),
        isFirstEver: true
      });
    });

    it('should detect subsequent new venues', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500, {
          placeName: 'Archery Club A',
          latitude: 51.5074,
          longitude: -0.1278
        }),
        createMockShoot(2, '2023-01-15', 'windsor', 400, {
          placeName: 'Archery Club A',
          latitude: 51.5074,
          longitude: -0.1278
        }),
        createMockShoot(3, '2023-02-01', 'national', 520, {
          placeName: 'Outdoor Range B',
          latitude: 52.2053,
          longitude: 0.1218
        })
      ];

      const venues = detectNewVenues(shoots);

      expect(venues).toHaveLength(2);
      expect(venues[0].location.placeName).toBe('Archery Club A');
      expect(venues[0].isFirstEver).toBe(true);
      expect(venues[1].location.placeName).toBe('Outdoor Range B');
      expect(venues[1].isFirstEver).toBe(false);
    });

    it('should ignore shoots without location data', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500),
        createMockShoot(2, '2023-01-15', 'windsor', 400, {
          placeName: 'Archery Club A',
          latitude: 51.5074,
          longitude: -0.1278
        })
      ];

      const venues = detectNewVenues(shoots);

      expect(venues).toHaveLength(1);
      expect(venues[0].location.placeName).toBe('Archery Club A');
    });

    it('should handle case-insensitive venue matching', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500, {
          placeName: 'Archery Club A',
          latitude: 51.5074,
          longitude: -0.1278
        }),
        createMockShoot(2, '2023-01-15', 'windsor', 400, {
          placeName: 'ARCHERY CLUB A',
          latitude: 51.5074,
          longitude: -0.1278
        })
      ];

      const venues = detectNewVenues(shoots);

      expect(venues).toHaveLength(1);
      expect(venues[0].location.placeName).toBe('Archery Club A');
    });
  });

  describe('detectPersonalBests', () => {
    it('should detect first time shooting a round', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500)
      ];

      const events = detectPersonalBests(shoots);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'first-time-round',
        date: '2023-01-01',
        shootId: 1,
        gameType: 'national',
        score: 500
      });
    });

    it('should detect personal best improvements', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500),
        createMockShoot(2, '2023-01-15', 'national', 480), // Lower score, no event
        createMockShoot(3, '2023-02-01', 'national', 520)  // New PB
      ];

      const events = detectPersonalBests(shoots);

      expect(events).toHaveLength(2);
      
      // First time shooting national
      expect(events[0]).toEqual({
        type: 'first-time-round',
        date: '2023-01-01',
        shootId: 1,
        gameType: 'national',
        score: 500
      });
      
      // Personal best improvement
      expect(events[1]).toEqual({
        type: 'personal-best',
        date: '2023-02-01',
        shootId: 3,
        gameType: 'national',
        score: 520,
        previousBest: 500,
        isFirstTimeRound: false
      });
    });

    it('should track different game types separately', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500),
        createMockShoot(2, '2023-01-15', 'windsor', 400),
        createMockShoot(3, '2023-02-01', 'national', 520)
      ];

      const events = detectPersonalBests(shoots);

      expect(events).toHaveLength(3);
      expect(events.map(e => e.type)).toEqual([
        'first-time-round',
        'first-time-round', 
        'personal-best'
      ]);
      expect(events.map(e => e.gameType)).toEqual(['national', 'windsor', 'national']);
    });

    it('should ignore practice rounds', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'practice national', 500),
        createMockShoot(2, '2023-01-15', 'national practice', 480),
        createMockShoot(3, '2023-02-01', 'national', 520)
      ];

      const events = detectPersonalBests(shoots);

      expect(events).toHaveLength(1);
      expect(events[0].gameType).toBe('national');
    });

    it('should handle case-insensitive game type matching', () => {
      const shoots: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'National', 500),
        createMockShoot(2, '2023-01-15', 'NATIONAL', 520)
      ];

      const events = detectPersonalBests(shoots);

      expect(events).toHaveLength(2);
      expect(events[1].type).toBe('personal-best');
    });
  });

  describe('isSameVenue', () => {
    it('should match venues by place name', () => {
      const loc1 = { placeName: 'Club A', latitude: 51.5074, longitude: -0.1278, timestamp: 123 };
      const loc2 = { placeName: 'Club A', latitude: 52.0000, longitude: 1.0000, timestamp: 456 };

      expect(isSameVenue(loc1, loc2)).toBe(true);
    });

    it('should match venues by coordinates when place names missing', () => {
      const loc1 = { latitude: 51.5074, longitude: -0.1278, timestamp: 123 };
      const loc2 = { latitude: 51.5075, longitude: -0.1279, timestamp: 456 };

      expect(isSameVenue(loc1, loc2)).toBe(true);
    });

    it('should not match distant coordinates', () => {
      const loc1 = { latitude: 51.5074, longitude: -0.1278, timestamp: 123 };
      const loc2 = { latitude: 52.0000, longitude: 1.0000, timestamp: 456 };

      expect(isSameVenue(loc1, loc2)).toBe(false);
    });

    it('should be case-insensitive for place names', () => {
      const loc1 = { placeName: 'Club A', latitude: 51.5074, longitude: -0.1278, timestamp: 123 };
      const loc2 = { placeName: 'CLUB A', latitude: 52.0000, longitude: 1.0000, timestamp: 456 };

      expect(isSameVenue(loc1, loc2)).toBe(true);
    });
  });

  describe('createEnhancedDiaryTimeline', () => {
    it('should combine all event types and sort by date', () => {
      const shootsWithNotes: HistoryItem[] = [
        createMockShoot(2, '2023-01-15', 'windsor', 400)
      ];

      const achievements: DiaryAchievement[] = [{
        id: 'achievement-1',
        name: 'First Achievement',
        description: 'Well done!',
        tier: 'bronze',
        achievedDate: '2023-01-10',
        achievingShootId: 1,
        unlockedAt: '2023-01-10'
      }];

      const allHistory: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500, {
          placeName: 'New Club',
          latitude: 51.5074,
          longitude: -0.1278
        }),
        createMockShoot(2, '2023-01-15', 'windsor', 400),
        createMockShoot(3, '2023-02-01', 'national', 520)
      ];

      const timeline = createEnhancedDiaryTimeline(shootsWithNotes, achievements, allHistory);

      expect(timeline).toHaveLength(6); // 1 note + 1 achievement + 1 venue + 3 PB events (1 first-time national, 1 first-time windsor, 1 PB national)
      
      // Should be sorted by date (most recent first)
      const dates = timeline.map(item => item.date);
      expect(dates).toEqual(['2023-02-01', '2023-01-15', '2023-01-15', '2023-01-10', '2023-01-01', '2023-01-01']);
      
      // Should include all event types
      const types = timeline.map(item => item.type);
      expect(types).toContain('note');
      expect(types).toContain('achievement');
      expect(types).toContain('new-venue');
      expect(types).toContain('first-time-round');
      expect(types).toContain('personal-best');
    });

    it('should attach shoot data to venue and PB events', () => {
      const allHistory: HistoryItem[] = [
        createMockShoot(1, '2023-01-01', 'national', 500, {
          placeName: 'Test Club',
          latitude: 51.5074,
          longitude: -0.1278
        })
      ];

      const timeline = createEnhancedDiaryTimeline([], [], allHistory);

      const venueEvent = timeline.find(item => item.type === 'new-venue');
      const pbEvent = timeline.find(item => item.type === 'first-time-round');
      
      expect(venueEvent).toHaveProperty('shoot');
      expect(pbEvent).toHaveProperty('shoot');
      expect(venueEvent?.shoot?.id).toBe(1);
      expect(pbEvent?.shoot?.id).toBe(1);
    });
  });
});