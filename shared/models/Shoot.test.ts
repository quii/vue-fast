import { groupParticipantsByRound, getUniqueRoundNames, ShootParticipant } from './Shoot';
import { describe, expect, it} from 'vitest'

// Helper function to create a mock participant
function createMockParticipant(overrides: Partial<ShootParticipant> = {}): ShootParticipant {
  return {
    id: 'participant-1',
    archerName: 'Test Archer',
    roundName: 'Portsmouth',
    totalScore: 100,
    arrowsShot: 36,
    finished: false,
    lastUpdated: new Date(),
    ...overrides
  };
}

describe('groupParticipantsByRound', () => {
  it('should return empty object for empty array', () => {
    const result = groupParticipantsByRound([]);
    expect(result).toEqual({});
  });

  it('should group single participant correctly', () => {
    const participant = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: 'Portsmouth'
    });

    const result = groupParticipantsByRound([participant]);

    expect(result).toEqual({
      'Portsmouth': [participant]
    });
  });

  it('should group multiple participants with same round', () => {
    const alice = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: 'Portsmouth'
    });

    const bob = createMockParticipant({
      id: 'p2',
      archerName: 'Bob',
      roundName: 'Portsmouth'
    });

    const result = groupParticipantsByRound([alice, bob]);

    expect(result).toEqual({
      'Portsmouth': [alice, bob]
    });
  });

  it('should group participants with different rounds separately', () => {
    const alice = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: 'Portsmouth'
    });

    const bob = createMockParticipant({
      id: 'p2',
      archerName: 'Bob',
      roundName: 'WA 18'
    });

    const result = groupParticipantsByRound([alice, bob]);

    expect(result).toEqual({
      'Portsmouth': [alice],
      'WA 18': [bob]
    });
  });

  it('should handle mixed grouping with multiple rounds', () => {
    const alice = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: 'Portsmouth'
    });

    const bob = createMockParticipant({
      id: 'p2',
      archerName: 'Bob',
      roundName: 'WA 18'
    });

    const charlie = createMockParticipant({
      id: 'p3',
      archerName: 'Charlie',
      roundName: 'Portsmouth'
    });

    const diana = createMockParticipant({
      id: 'p4',
      archerName: 'Diana',
      roundName: 'Frostbite'
    });

    const result = groupParticipantsByRound([alice, bob, charlie, diana]);

    expect(result).toEqual({
      'Portsmouth': [alice, charlie],
      'WA 18': [bob],
      'Frostbite': [diana]
    });
  });

  it('should preserve participant order within groups', () => {
    const alice = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: 'Portsmouth',
      totalScore: 500
    });

    const bob = createMockParticipant({
      id: 'p2',
      archerName: 'Bob',
      roundName: 'Portsmouth',
      totalScore: 400
    });

    const charlie = createMockParticipant({
      id: 'p3',
      archerName: 'Charlie',
      roundName: 'Portsmouth',
      totalScore: 600
    });

    const result = groupParticipantsByRound([alice, bob, charlie]);

    expect(result['Portsmouth']).toEqual([alice, bob, charlie]);
  });

  it('should handle participants with identical round names but different cases', () => {
    const alice = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: 'Portsmouth'
    });

    const bob = createMockParticipant({
      id: 'p2',
      archerName: 'Bob',
      roundName: 'portsmouth'
    });

    const result = groupParticipantsByRound([alice, bob]);

    expect(result).toEqual({
      'Portsmouth': [alice],
      'portsmouth': [bob]
    });
  });

  it('should handle empty string round names', () => {
    const alice = createMockParticipant({
      id: 'p1',
      archerName: 'Alice',
      roundName: ''
    });

    const bob = createMockParticipant({
      id: 'p2',
      archerName: 'Bob',
      roundName: 'Portsmouth'
    });

    const result = groupParticipantsByRound([alice, bob]);

    expect(result).toEqual({
      '': [alice],
      'Portsmouth': [bob]
    });
  });
});

describe('getUniqueRoundNames', () => {
  it('should return empty array for empty input', () => {
    const result = getUniqueRoundNames([]);
    expect(result).toEqual([]);
  });

  it('should return single round name for single participant', () => {
    const participant = createMockParticipant({
      roundName: 'Portsmouth'
    });

    const result = getUniqueRoundNames([participant]);
    expect(result).toEqual(['Portsmouth']);
  });

  it('should return unique round names and remove duplicates', () => {
    const alice = createMockParticipant({
      id: 'p1',
      roundName: 'Portsmouth'
    });

    const bob = createMockParticipant({
      id: 'p2',
      roundName: 'WA 18'
    });

    const charlie = createMockParticipant({
      id: 'p3',
      roundName: 'Portsmouth'
    });

    const result = getUniqueRoundNames([alice, bob, charlie]);
    expect(result).toEqual(['Portsmouth', 'WA 18']);
  });

  it('should sort round names alphabetically', () => {
    const participants = [
      createMockParticipant({ id: 'p1', roundName: 'Zebra Round' }),
      createMockParticipant({ id: 'p2', roundName: 'Alpha Round' }),
      createMockParticipant({ id: 'p3', roundName: 'Beta Round' }),
      createMockParticipant({ id: 'p4', roundName: 'Alpha Round' }) // duplicate
    ];

    const result = getUniqueRoundNames(participants);
    expect(result).toEqual(['Alpha Round', 'Beta Round', 'Zebra Round']);
  });

  it('should handle empty string round names', () => {
    const participants = [
      createMockParticipant({ id: 'p1', roundName: '' }),
      createMockParticipant({ id: 'p2', roundName: 'Portsmouth' }),
      createMockParticipant({ id: 'p3', roundName: '' })
    ];

    const result = getUniqueRoundNames(participants);
    expect(result).toEqual(['', 'Portsmouth']);
  });

  it('should handle case-sensitive sorting', () => {
    const participants = [
      createMockParticipant({ id: 'p1', roundName: 'portsmouth' }),
      createMockParticipant({ id: 'p2', roundName: 'Portsmouth' }),
      createMockParticipant({ id: 'p3', roundName: 'WA 18' })
    ];

    const result = getUniqueRoundNames(participants);
    expect(result).toEqual(['Portsmouth', 'WA 18', 'portsmouth']);
  });
});