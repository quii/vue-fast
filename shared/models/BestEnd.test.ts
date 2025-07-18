import { describe, test, expect } from 'vitest';
import { findBestEnds, BestEnd } from './BestEnd.js';
import { Shoot, ShootParticipant } from './Shoot.js';

describe('findBestEnds', () => {
  const createParticipant = (
    id: string,
    archerName: string,
    roundName: string,
    scores: (number | string)[] = [],
    totalScore: number = 0
  ): ShootParticipant => ({
    id,
    archerName,
    roundName,
    totalScore,
    arrowsShot: scores.length,
    finished: false,
    scores,
    lastUpdated: new Date(),
  });

  const createShoot = (participants: ShootParticipant[]): Shoot => ({
    id: 'test-shoot',
    code: '1234',
    creatorName: 'Test Creator',
    createdAt: new Date(),
    expiresAt: new Date(),
    participants,
    lastUpdated: new Date(),
  });

  test('returns empty array when no participants', () => {
    const shoot = createShoot([]);
    const result = findBestEnds(shoot);
    expect(result).toEqual([]);
  });

  test('returns empty array when no participants have scores', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', []),
      createParticipant('2', 'Bob', 'WA 70m', []),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    expect(result).toEqual([]);
  });

  test('returns empty array when no complete ends', () => {
    const participants = [
      createParticipant('1', 'Alice', 'wa 70m', [10, 9, 8]), // Only 3 arrows for a 6-arrow end
      createParticipant('2', 'Bob', 'wa 70m', [9, 8]),      // Only 2 arrows
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    expect(result).toEqual([]);
  });

  test('finds best end for single participant with one complete end', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [10, 10, 9, 9, 8, 8], 54),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'WA 70m',
      archerName: 'Alice',
      endScores: [10, 10, 9, 9, 8, 8],
      totalScore: 54,
      endSize: 6,
    });
  });

  test('finds best end for single participant with multiple ends', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [
        10, 10, 9, 9, 8, 8,  // End 1: 54 points
        10, 10, 10, 9, 9, 9, // End 2: 57 points (best)
        9, 8, 8, 7, 7, 6,    // End 3: 45 points
      ], 156),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'WA 70m',
      archerName: 'Alice',
      endScores: [10, 10, 10, 9, 9, 9],
      totalScore: 57,
      endSize: 6,
    });
  });

  test('finds best end across multiple participants in same round', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [
        10, 9, 9, 8, 8, 7,   // End 1: 51 points
        9, 8, 8, 7, 7, 6,    // End 2: 45 points
      ], 96),
      createParticipant('2', 'Bob', 'WA 70m', [
        10, 10, 10, 9, 9, 8, // End 1: 56 points (best overall)
        8, 8, 7, 7, 6, 6,    // End 2: 42 points
      ], 98),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'WA 70m',
      archerName: 'Bob',
      endScores: [10, 10, 10, 9, 9, 8],
      totalScore: 56,
      endSize: 6,
    });
  });

  test('finds best end for each round when multiple rounds', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [10, 10, 9, 9, 8, 8], 54),
      createParticipant('2', 'Bob', 'National', [9, 9, 8, 8, 7, 7], 48),
      createParticipant('3', 'Charlie', 'WA 70m', [10, 10, 10, 9, 9, 9], 57), // Best for WA 70m
      createParticipant('4', 'David', 'National', [10, 10, 9, 9, 8, 8], 54),   // Best for National
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(2);
    
    // Should be sorted by round name
    const wa70mResult = result.find(r => r.roundName === 'WA 70m');
    const nationalResult = result.find(r => r.roundName === 'National');
    
    expect(wa70mResult).toEqual({
      roundName: 'WA 70m',
      archerName: 'Charlie',
      endScores: [10, 10, 10, 9, 9, 9],
      totalScore: 57,
      endSize: 6,
    });
    
    expect(nationalResult).toEqual({
      roundName: 'National',
      archerName: 'David',
      endScores: [10, 10, 9, 9, 8, 8],
      totalScore: 54,
      endSize: 6,
    });
  });

  test('handles X scores correctly', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', ['X', 'X', 10, 9, 9, 8], 56),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'WA 70m',
      archerName: 'Alice',
      endScores: ['X', 'X', 10, 9, 9, 8],
      totalScore: 56, // X = 10, X = 10, 10, 9, 9, 8 = 56
      endSize: 6,
    });
  });

  test('handles miss scores correctly', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [10, 9, 8, 7, 'M', 'M'], 34),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'WA 70m',
      archerName: 'Alice',
      endScores: [10, 9, 8, 7, 'M', 'M'],
      totalScore: 34, // 10 + 9 + 8 + 7 + 0 + 0 = 34
      endSize: 6,
    });
  });

  test('uses correct end size for indoor rounds (6 arrows)', () => {
    const participants = [
      createParticipant('1', 'Alice', 'portsmouth', [10, 9, 8, 7, 6, 5], 45),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'portsmouth',
      archerName: 'Alice',
      endScores: [10, 9, 8, 7, 6, 5],
      totalScore: 45,
      endSize: 6,
    });
  });

  test('uses correct end size for Worcester 5-spot (5 arrows)', () => {
    const participants = [
      createParticipant('1', 'Alice', 'Worcester (5 spot)', [5, 4, 3, 2, 1], 15),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'Worcester (5 spot)',
      archerName: 'Alice',
      endScores: [5, 4, 3, 2, 1],
      totalScore: 15,
      endSize: 5,
    });
  });

  test('ignores incomplete ends at the end of scores', () => {
    const participants = [
      createParticipant('1', 'Alice', 'WA 70m', [
        10, 10, 9, 9, 8, 8,  // Complete end: 54 points
        10, 9, 8,            // Incomplete end (only 3 arrows)
      ], 62),
    ];
    const shoot = createShoot(participants);
    const result = findBestEnds(shoot);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roundName: 'WA 70m',
      archerName: 'Alice',
      endScores: [10, 10, 9, 9, 8, 8],
      totalScore: 54,
      endSize: 6,
    });
  });
});
