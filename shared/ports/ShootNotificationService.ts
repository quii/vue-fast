export enum NotificationType {
  POSITION_CHANGE = 'position_change',
  END_COMPLETE = 'end_complete',
  JOINED_SHOOT = 'joined_shoot',
  LEFT_SHOOT = 'left_shoot',
  SCORE_UPDATE = 'score_update'  // New notification type
}

export interface PositionChangeNotification {
  type: NotificationType.POSITION_CHANGE;
  archerName: string;
  previousPosition: number;
  currentPosition: number;
  totalParticipants: number;
  shoot?: any; // Add optional shoot data
}

export interface EndCompleteNotification {
  type: NotificationType.END_COMPLETE;
  archerName: string;
  currentPosition: number;
  totalParticipants: number;
  positionChange?: number; // positive for improvement, negative for decline
  shoot?: any; // Add optional shoot data
}

export interface JoinedShootNotification {
  type: NotificationType.JOINED_SHOOT;
  archerName: string;
  shoot?: any; // Add optional shoot data
}

export interface LeftShootNotification {
  type: NotificationType.LEFT_SHOOT;
  archerName: string;
  shoot?: any; // Add optional shoot data
}

export interface ScoreUpdateNotification {
  type: NotificationType.SCORE_UPDATE;
  archerName: string;
  totalScore: number;
  arrowsShot: number;
  roundName: string;
  shoot?: any; // Add optional shoot data for real-time sync
}

export type ShootNotification =
  | PositionChangeNotification
  | EndCompleteNotification
  | JoinedShootNotification
  | LeftShootNotification
  | ScoreUpdateNotification;

/**
 * Service interface for shoot notifications
 */
export interface ShootNotificationService {
  /**
   * Send a notification to all participants in a shoot
   * @param code The 4-digit code of the shoot
   * @param notification The notification to send
   */
  sendNotification(code: string, notification: ShootNotification): Promise<void>;
}