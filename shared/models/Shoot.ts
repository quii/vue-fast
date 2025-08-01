/**
 * Represents a shared shooting session that multiple archers can join
 */
export interface Shoot {
  /** Unique identifier for the shoot */
  id: string;

  /** 4-digit code used for joining the shoot */
  code: string;

  /** Name of the archer who created the shoot */
  creatorName: string;

  /** Optional title for the shoot (max 100 characters) */
  title?: string;

  /** Timestamp when the shoot was created */
  createdAt: Date;

  /** Timestamp when the shoot expires (end of the current day) */
  expiresAt: Date;

  /** List of archers participating in the shoot */
  participants: ShootParticipant[];

  /** Timestamp of the last update to the shoot */
  lastUpdated: Date;
}

/**
 * Represents an archer participating in a shoot
 */
export interface ShootParticipant {
  /** Unique identifier for the participant */
  id: string;

  /** Archer's profile name */
  archerName: string;

  /** The round they're shooting */
  roundName: string;

  /** Current total score */
  totalScore: number;

  /** Number of arrows shot so far */
  arrowsShot: number;

  /** Whether this archer has finished their round */
  finished: boolean;

  /** Current classification based on score */
  currentClassification?: string;

  /** Individual arrow scores for viewing scorecard */
  scores?: (number | string)[];

  /** Timestamp of the last score update */
  lastUpdated: Date;

  /** Previous position in the leaderboard (for tracking changes) */
  previousPosition?: number;

  /** Current position in the leaderboard */
  currentPosition?: number;
}

/**
 * Groups participants by their round name
 * @param participants - Array of ShootParticipant objects
 * @returns Object with roundName as keys and arrays of participants as values
 */
export function groupParticipantsByRound(participants: ShootParticipant[]): Record<string, ShootParticipant[]> {
  return participants.reduce((groups, participant) => {
    const roundName = participant.roundName;

    if (!groups[roundName]) {
      groups[roundName] = [];
    }

    groups[roundName].push(participant);

    return groups;
  }, {} as Record<string, ShootParticipant[]>);
}

/**
 * Gets all unique round names from a list of participants
 * @param participants - Array of ShootParticipant objects
 * @returns Array of unique round names, sorted alphabetically
 */
export function getUniqueRoundNames(participants: ShootParticipant[]): string[] {
  const uniqueRounds = new Set(participants.map(p => p.roundName));
  return Array.from(uniqueRounds).sort();
}
