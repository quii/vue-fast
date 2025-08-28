import { describe, test, expect } from 'vitest';
import { compareShootWithHistory } from './shoot_comparison';

describe('compareShootWithHistory', () => {
  test('returns null when no historical shoots provided', () => {
    const currentShoot = {
      scores: [10, 9, 8, 7, 6, 5],
      score: 45,
      gameType: 'national'
    };

    const result = compareShootWithHistory(currentShoot, []);
    expect(result).toBe(null);
  });

  test('returns null when historical shoots is null', () => {
    const currentShoot = {
      scores: [10, 9, 8, 7, 6, 5],
      score: 45,
      gameType: 'national'
    };

    const result = compareShootWithHistory(currentShoot, null as any);
    expect(result).toBe(null);
  });

  test('compares current shoot against individual historical shoots for single distance round', () => {
    const currentShoot = {
      scores: [10, 9, 8, 7, 6, 5], // Total: 45, Average per arrow: 7.5, End total: 45
      score: 45,
      gameType: 'national'
    };

    const historicalShoots = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [9, 8, 7, 6, 5, 4], // Total: 39, Average per arrow: 6.5, End total: 39
        score: 39,
        gameType: 'national'
      },
      {
        id: 2, 
        date: '2024-01-02',
        scores: [8, 7, 6, 5, 4, 3], // Total: 33, Average per arrow: 5.5, End total: 33
        score: 33,
        gameType: 'national'
      }
    ];

    const result = compareShootWithHistory(currentShoot, historicalShoots);

    expect(result).not.toBe(null);
    expect(result!.currentShoot.totalScore).toBe(45);
    expect(result!.currentShoot.distances).toHaveLength(1);
    expect(result!.currentShoot.distances[0].averageArrowValue).toBe(7.5);
    expect(result!.currentShoot.distances[0].averageEndTotal).toBe(45);

    expect(result!.historicalComparisons).toHaveLength(2);
    
    // First comparison (vs shoot scoring 39)
    const firstComparison = result!.historicalComparisons[0];
    expect(firstComparison.shoot.id).toBe(1);
    expect(firstComparison.shoot.score).toBe(39);
    expect(firstComparison.totalScoreDifference).toBe(6); // 45 - 39
    expect(firstComparison.distances[0].averageArrowValueDifference).toBe(1.0); // 7.5 - 6.5
    expect(firstComparison.distances[0].averageEndTotalDifference).toBe(6); // 45 - 39

    // Second comparison (vs shoot scoring 33)
    const secondComparison = result!.historicalComparisons[1];
    expect(secondComparison.shoot.id).toBe(2);
    expect(secondComparison.shoot.score).toBe(33);
    expect(secondComparison.totalScoreDifference).toBe(12); // 45 - 33
    expect(secondComparison.distances[0].averageArrowValueDifference).toBe(2.0); // 7.5 - 5.5
    expect(secondComparison.distances[0].averageEndTotalDifference).toBe(12); // 45 - 33
  });

  test('handles multi-distance rounds correctly', () => {
    // Windsor round has multiple distances
    const currentShoot = {
      scores: [
        // First distance (6 arrows): 10,9,8,7,6,5 = 45 total, 7.5 avg, 45 end total
        10, 9, 8, 7, 6, 5,
        // Second distance (6 arrows): 8,7,6,5,4,3 = 33 total, 5.5 avg, 33 end total  
        8, 7, 6, 5, 4, 3
      ],
      score: 78,
      gameType: 'windsor'
    };

    const historicalShoots = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [
          9, 8, 7, 6, 5, 4, // First distance: 39 total, 6.5 avg, 39 end total
          7, 6, 5, 4, 3, 2  // Second distance: 27 total, 4.5 avg, 27 end total
        ],
        score: 66,
        gameType: 'windsor'
      }
    ];

    const result = compareShootWithHistory(currentShoot, historicalShoots);

    expect(result).not.toBe(null);
    expect(result!.currentShoot.totalScore).toBe(78);
    expect(result!.currentShoot.distances).toHaveLength(2);

    expect(result!.historicalComparisons).toHaveLength(1);
    const comparison = result!.historicalComparisons[0];
    expect(comparison.totalScoreDifference).toBe(12); // 78 - 66
    expect(comparison.distances).toHaveLength(2);
    
    // First distance comparison
    expect(comparison.distances[0].averageArrowValueDifference).toBe(1.0); // 7.5 - 6.5
    expect(comparison.distances[0].averageEndTotalDifference).toBe(6); // 45 - 39
    
    // Second distance comparison  
    expect(comparison.distances[1].averageArrowValueDifference).toBe(1.0); // 5.5 - 4.5
    expect(comparison.distances[1].averageEndTotalDifference).toBe(6); // 33 - 27
  });

  test('handles multiple individual historical shoots correctly', () => {
    const currentShoot = {
      scores: [10, 9, 8, 7, 6, 5], // 45 total
      score: 45,
      gameType: 'national'
    };

    const historicalShoots = [
      {
        id: 10,
        date: '2024-01-10', 
        scores: [10, 10, 10, 10, 10, 10], // 60 total
        score: 60,
        gameType: 'national'
      },
      {
        id: 20,
        date: '2024-01-20',
        scores: [5, 5, 5, 5, 5, 5], // 30 total
        score: 30,
        gameType: 'national'
      }
    ];

    const result = compareShootWithHistory(currentShoot, historicalShoots);

    expect(result).not.toBe(null);
    expect(result!.historicalComparisons).toHaveLength(2);
    
    // First comparison: current (45) vs historical (60) = -15 difference
    const firstComparison = result!.historicalComparisons[0];
    expect(firstComparison.shoot.id).toBe(10);
    expect(firstComparison.totalScoreDifference).toBe(-15); // 45 - 60
    
    // Second comparison: current (45) vs historical (30) = +15 difference
    const secondComparison = result!.historicalComparisons[1];
    expect(secondComparison.shoot.id).toBe(20);
    expect(secondComparison.totalScoreDifference).toBe(15); // 45 - 30
  });

  test('handles edge case with Worcester scores', () => {
    const currentShoot = {
      scores: [5, 5, 5, 5, 5, 5], // Worcester: 30 total
      score: 30,
      gameType: 'worcester'
    };

    const historicalShoots = [
      {
        id: 1,
        date: '2024-01-01',
        scores: [5, 5, 'X', 5, 5, 5], // Worcester with X (10): 35 total
        score: 35,
        gameType: 'worcester'
      }
    ];

    const result = compareShootWithHistory(currentShoot, historicalShoots);

    expect(result).not.toBe(null);
    expect(result!.historicalComparisons).toHaveLength(1);
    expect(result!.historicalComparisons[0].totalScoreDifference).toBe(-5); // 30 - 35
  });
});