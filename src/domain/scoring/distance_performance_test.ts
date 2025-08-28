import { describe, test, expect } from 'vitest';
import { analyzeDistancePerformance } from './distance_performance';

describe('analyzeDistancePerformance', () => {
  test('returns empty data for empty history', () => {
    const result = analyzeDistancePerformance([]);
    expect(result).toEqual({ distances: [] });
  });

  test('returns empty data for null history', () => {
    const result = analyzeDistancePerformance(null as any);
    expect(result).toEqual({ distances: [] });
  });

  test('analyzes single distance round performance', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [10, 9, 8, 7, 6, 5], // Average end total: 45
        gameType: 'national'
      },
      {
        id: 2,
        date: '2024-01-02', 
        scores: [9, 8, 7, 6, 5, 4], // Average end total: 39
        gameType: 'national'
      }
    ];

    const result = analyzeDistancePerformance(shootHistory);

    // National rounds have null distance and are now filtered out
    expect(result.distances).toHaveLength(0);
  });

  test('analyzes multi-distance round performance', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [
          // First distance: 10,9,8,7,6,5 = 45 total, 45 avg end
          10, 9, 8, 7, 6, 5,
          // Second distance: 8,7,6,5,4,3 = 33 total, 33 avg end
          8, 7, 6, 5, 4, 3
        ],
        gameType: 'windsor'
      }
    ];

    const result = analyzeDistancePerformance(shootHistory);

    expect(result.distances).toHaveLength(2);
    
    // Distances should be sorted by distance value
    const firstDistance = result.distances[0];
    const secondDistance = result.distances[1];
    
    expect(firstDistance.roundsShot).toBe(1);
    expect(firstDistance.arrowsShot).toBe(6);
    expect(firstDistance.averageEndTotalsOverTime).toHaveLength(1);
    
    expect(secondDistance.roundsShot).toBe(1);
    expect(secondDistance.arrowsShot).toBe(6);
    expect(secondDistance.averageEndTotalsOverTime).toHaveLength(1);
  });

  test('limits to most recent 10 shoots for line graph', () => {
    const shootHistory = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      scores: [
        10, 9, 8, 7, 6, 5,  // First distance: 60 yards
        8, 7, 6, 5, 4, 3    // Second distance: 50 yards
      ],
      gameType: 'windsor'
    }));

    const result = analyzeDistancePerformance(shootHistory);

    expect(result.distances).toHaveLength(2);
    
    const distanceStats = result.distances[0];
    expect(distanceStats.roundsShot).toBe(15); // Total rounds shot
    expect(distanceStats.averageEndTotalsOverTime).toHaveLength(10); // But only 10 in graph
    
    // Should be the most recent 10 shoots (ids 6-15)
    expect(distanceStats.averageEndTotalsOverTime[0].shootId).toBe(6);
    expect(distanceStats.averageEndTotalsOverTime[9].shootId).toBe(15);
  });

  test('handles shoots across multiple distances correctly', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [10, 9, 8, 7, 6, 5], // National round
        gameType: 'national'
      },
      {
        id: 2,
        date: '2024-01-02',
        scores: [
          10, 9, 8, 7, 6, 5, // Windsor first distance
          8, 7, 6, 5, 4, 3   // Windsor second distance  
        ],
        gameType: 'windsor'
      }
    ];

    const result = analyzeDistancePerformance(shootHistory);

    // Should have stats for 2 distances from Windsor:
    // - Windsor first distance
    // - Windsor second distance
    // National (null distance) is filtered out
    expect(result.distances.length).toBe(2);
    
    // Each distance should track its own performance separately
    result.distances.forEach(distance => {
      expect(distance.roundsShot).toBeGreaterThan(0);
      expect(distance.arrowsShot).toBeGreaterThan(0);
      expect(distance.bestEndTotal).toBeGreaterThan(0);
      expect(distance.averageEndTotalsOverTime.length).toBeGreaterThan(0);
    });
  });

  test('calculates best end total correctly', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [
          10, 10, 10, 10, 10, 10, // Perfect end: 60
          5, 5, 5, 5, 5, 5        // Lower end: 30
        ],
        gameType: 'windsor'
      },
      {
        id: 2,
        date: '2024-01-02', 
        scores: [
          8, 8, 8, 8, 8, 8,       // Medium end: 48
          3, 3, 3, 3, 3, 3        // Low end: 18
        ],
        gameType: 'windsor'
      }
    ];

    const result = analyzeDistancePerformance(shootHistory);

    expect(result.distances).toHaveLength(2);
    expect(result.distances[0].bestEndTotal).toBe(60); // Should be the highest from first distance
    expect(result.distances[1].bestEndTotal).toBe(30); // Should be the highest from second distance
  });

  test('skips shoots that cannot be processed', () => {
    const shootHistory = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [
          10, 9, 8, 7, 6, 5,
          8, 7, 6, 5, 4, 3
        ],
        gameType: 'windsor'
      },
      {
        id: 2,
        date: '2024-01-02',
        scores: null, // Invalid scores - should be skipped
        gameType: 'windsor'
      },
      {
        id: 3,
        date: '2024-01-03',
        // Missing scores - should be skipped
        gameType: 'windsor'
      }
    ];

    const result = analyzeDistancePerformance(shootHistory);

    expect(result.distances).toHaveLength(2);
    result.distances.forEach(distance => {
      expect(distance.roundsShot).toBe(1); // Only one valid shoot processed
    });
  });
});