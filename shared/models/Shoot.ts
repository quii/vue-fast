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

  /** Current classification based on score */
  currentClassification?: string;

  /** Timestamp of the last score update */
  lastUpdated: Date;

  /** Previous position in the leaderboard (for tracking changes) */
  previousPosition?: number;

  /** Current position in the leaderboard */
  currentPosition?: number;
}