import { Shoot, ShootParticipant } from '../models/Shoot.js';
import { ShootService } from '../ports/ShootService.js';
import { ShootNotificationService, NotificationType } from '../ports/ShootNotificationService.js';

/**
 * Implementation of the ShootService using in-memory storage for testing
 */
export class InMemoryShootService implements ShootService {
  private shoots: Map<string, Shoot> = new Map();
  private notificationService?: ShootNotificationService;

  constructor(notificationService?: ShootNotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Generates a random 4-digit code for a shoot
   * @returns A unique 4-digit code
   */
  private generateCode(): string {
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Ensure the code is unique
    if (this.shoots.has(code)) {
      return this.generateCode();
    }

    return code;
  }

  /**
   * Creates a new shoot
   * @param creatorName Name of the archer creating the shoot
   * @returns Promise with the created shoot details
   */
  async createShoot(creatorName: string): Promise<{ shoot: Shoot; code: string }> {
    const code = this.generateCode();
    const now = new Date();

    // Set expiration to end of current day
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999);

    const shoot: Shoot = {
      id: `shoot_${Date.now()}`,
      code,
      creatorName,
      createdAt: now,
      expiresAt,
      participants: [],
      lastUpdated: now
    };

    this.shoots.set(code, shoot);

    return { shoot, code };
  }

  /**
   * Joins an existing shoot
   * @param code The 4-digit code of the shoot to join
   * @param archerName Name of the archer joining the shoot
   * @param roundName Name of the round the archer is shooting
   * @returns Promise with success status and shoot details
   */
  async joinShoot(code: string, archerName: string, roundName: string): Promise<{ success: boolean; shoot?: Shoot }> {
    const shoot = this.shoots.get(code);

    if (!shoot) {
      return { success: false };
    }

    // Check if the archer is already in the shoot
    const existingParticipant = shoot.participants.find(p => p.archerName === archerName);

    if (existingParticipant) {
      // Update the existing participant's round if needed
      if (existingParticipant.roundName !== roundName) {
        existingParticipant.roundName = roundName;
        shoot.lastUpdated = new Date();
      }
    } else {
      // Add the new participant
      const participant: ShootParticipant = {
        id: `participant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        archerName,
        roundName,
        totalScore: 0,
        lastUpdated: new Date(),
      };

      shoot.participants.push(participant);
      shoot.lastUpdated = new Date();

      // Send notification that a new archer joined
      if (this.notificationService) {
        await this.notificationService.sendNotification(code, {
          type: NotificationType.JOINED_SHOOT,
          archerName
        });
      }
    }

    // Update positions for all participants
    this.updatePositions(shoot);

    return { success: true, shoot };
  }

  /**
   * Updates an archer's score in a shoot
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer
   * @param totalScore Current total score
   * @param roundName Name of the round (in case it changed)
   * @returns Promise with success status and updated shoot details
   */
  async updateScore(code: string, archerName: string, totalScore: number, roundName: string): Promise<{ success: boolean; shoot?: Shoot }> {
    const shoot = this.shoots.get(code);

    if (!shoot) {
      return { success: false };
    }

    const participant = shoot.participants.find(p => p.archerName === archerName);

    if (!participant) {
      return { success: false };
    }

    // Store previous position for notification
    const previousPosition = participant.currentPosition;

    // Update participant data
    participant.totalScore = totalScore;
    participant.roundName = roundName;
    participant.lastUpdated = new Date();
    shoot.lastUpdated = new Date();

    // Update positions for all participants
    this.updatePositions(shoot);

    // Check if position changed and send notification
    if (this.notificationService &&
        previousPosition !== undefined &&
        participant.currentPosition !== undefined &&
        previousPosition !== participant.currentPosition) {

      await this.notificationService.sendNotification(code, {
        type: NotificationType.POSITION_CHANGE,
        archerName,
        previousPosition,
        currentPosition: participant.currentPosition,
        totalParticipants: shoot.participants.length
      });
    }

    return { success: true, shoot };
  }

  /**
   * Removes an archer from a shoot
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer to remove
   * @returns Promise with success status
   */
  async leaveShoot(code: string, archerName: string): Promise<{ success: boolean }> {
    const shoot = this.shoots.get(code);

    if (!shoot) {
      return { success: false };
    }

    const initialLength = shoot.participants.length;
    shoot.participants = shoot.participants.filter(p => p.archerName !== archerName);

    if (shoot.participants.length < initialLength) {
      shoot.lastUpdated = new Date();

      // Update positions for remaining participants
      this.updatePositions(shoot);

      // Send notification that an archer left
      if (this.notificationService) {
        await this.notificationService.sendNotification(code, {
          type: NotificationType.LEFT_SHOOT,
          archerName
        });
      }

      return { success: true };
    }

    return { success: false };
  }

  /**
   * Gets the current state of a shoot
   * @param code The 4-digit code of the shoot
   * @returns Promise with the shoot details
   */
  async getShoot(code: string): Promise<Shoot | null> {
    const shoot = this.shoots.get(code);

    if (!shoot) {
      return null;
    }

    // Check if the shoot has expired
    if (new Date() > shoot.expiresAt) {
      this.shoots.delete(code);
      return null;
    }

    return shoot;
  }

  /**
   * Checks if a shoot exists and is still active
   * @param code The 4-digit code of the shoot
   * @returns Promise with existence status
   */
  async shootExists(code: string): Promise<boolean> {
    const shoot = await this.getShoot(code);
    return shoot !== null;
  }

  /**
   * Updates the positions of all participants in a shoot based on their scores
   * @param shoot The shoot to update positions for
   */
  private updatePositions(shoot: Shoot): void {
    // Sort participants by score (descending)
    const sortedParticipants = [...shoot.participants].sort((a, b) => b.totalScore - a.totalScore);

    // Update positions
    sortedParticipants.forEach((participant, index) => {
      const originalParticipant = shoot.participants.find(p => p.id === participant.id);
      if (originalParticipant) {
        originalParticipant.previousPosition = originalParticipant.currentPosition;
        originalParticipant.currentPosition = index + 1;
      }
    });
  }

  /**
   * Cleans up expired shoots
   * Should be called periodically to free up memory
   */
  cleanupExpiredShoots(): void {
    const now = new Date();
    for (const [code, shoot] of this.shoots.entries()) {
      if (now > shoot.expiresAt) {
        this.shoots.delete(code);
      }
    }
  }
}