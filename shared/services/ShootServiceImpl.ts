import { Shoot, ShootParticipant } from '../models/Shoot.js';
import { ShootService } from '../ports/ShootService.js';
import { ShootRepository } from '../ports/ShootRepository.js';
import { ShootNotificationService, NotificationType } from '../ports/ShootNotificationService.js';

/**
 * Implementation of the ShootService that uses a repository for persistence
 */
export class ShootServiceImpl implements ShootService {
  private repository: ShootRepository;
  private notificationService?: ShootNotificationService;

  constructor(repository: ShootRepository, notificationService?: ShootNotificationService) {
    this.repository = repository;
    this.notificationService = notificationService;
  }

  /**
   * Generates a random 4-digit code for a shoot
   * @returns A unique 4-digit code
   */
  private async generateCode(): Promise<string> {
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Ensure the code is unique
    if (await this.repository.codeExists(code)) {
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
    const code = await this.generateCode();
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

    await this.repository.saveShoot(shoot);

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
    const shoot = await this.repository.getShootByCode(code);

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
        arrowsShot: 0,
        finished: false,
        lastUpdated: new Date(),
      };

      shoot.participants.push(participant);
      shoot.lastUpdated = new Date();

      // Send notification that a new archer joined
      if (this.notificationService) {
        await this.notificationService.sendNotification(code, {
          type: NotificationType.JOINED_SHOOT,
          archerName,
          shoot: shoot
        });
      }
    }

    // Update positions for all participants
    this.updatePositions(shoot);

    // Save the updated shoot
    await this.repository.saveShoot(shoot);

    // Send notification that a new archer joined - INCLUDE SHOOT DATA
    if (this.notificationService) {
      await this.notificationService.sendNotification(code, {
        type: NotificationType.JOINED_SHOOT,
        archerName,
        shoot: shoot  // Add the updated shoot data
      });
    }

    return { success: true, shoot };
  }

  /**
   * Updates an archer's score in a shoot
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer
   * @param totalScore Current total score
   * @param roundName Name of the round (in case it changed)
   * @param arrowsShot Number of arrows shot so far
   * @returns Promise with success status and updated shoot details
   */
  async updateScore(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification?: string, scores?: (number | string)[]): Promise<{ success: boolean; shoot?: Shoot }> {
    return this.updateParticipantScore(code, archerName, totalScore, roundName, arrowsShot, false, currentClassification, scores);
  }

  /**
   * Marks an archer as finished with their round and locks their final score
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer
   * @param totalScore Final total score
   * @param roundName Name of the round
   * @param arrowsShot Total number of arrows shot
   * @returns Promise with success status and updated shoot details
   */
  async finishShoot(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification?: string, scores?: (number | string)[]): Promise<{ success: boolean; shoot?: Shoot }> {
    return this.updateParticipantScore(code, archerName, totalScore, roundName, arrowsShot, true, currentClassification, scores);
  }

  /**
   * Removes an archer from a shoot
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer to remove
   * @returns Promise with success status
   */
  async leaveShoot(code: string, archerName: string): Promise<{ success: boolean }> {
    const shoot = await this.repository.getShootByCode(code);

    if (!shoot) {
      return { success: false };
    }

    const initialLength = shoot.participants.length;
    shoot.participants = shoot.participants.filter(p => p.archerName !== archerName);

    if (shoot.participants.length < initialLength) {
      shoot.lastUpdated = new Date();

      // Update positions for remaining participants
      this.updatePositions(shoot);

      // Save the updated shoot
      await this.repository.saveShoot(shoot);

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
    return this.repository.getShootByCode(code);
  }

  /**
   * Common logic for updating participant scores
   * @param code The 4-digit code of the shoot
   * @param archerName Name of the archer
   * @param totalScore Total score
   * @param roundName Name of the round
   * @param arrowsShot Number of arrows shot
   * @param markAsFinished Whether to mark the participant as finished
   * @returns Promise with success status and updated shoot details
   */
  private async updateParticipantScore(
    code: string,
    archerName: string,
    totalScore: number,
    roundName: string,
    arrowsShot: number,
    markAsFinished: boolean,
    currentClassification?: string,
    scores?: (number | string)[]
  ): Promise<{ success: boolean; shoot?: Shoot }> {
    const shoot = await this.repository.getShootByCode(code);

    if (!shoot) {
      return { success: false };
    }

    const participant = shoot.participants.find(p => p.archerName === archerName);

    if (!participant) {
      return { success: false };
    }

    // Don't allow score updates for finished participants (unless this is a finish operation)
    if (participant.finished && !markAsFinished) {
      return { success: false };
    }

    // Store previous position for notification
    const previousPosition = participant.currentPosition;

    // Update participant data
    participant.totalScore = totalScore;
    participant.arrowsShot = arrowsShot;
    participant.roundName = roundName;
    participant.currentClassification = currentClassification;
    participant.lastUpdated = new Date();
    shoot.lastUpdated = new Date();

    // Update individual scores if provided
    if (scores !== undefined) {
      participant.scores = [...scores];
    }

    // Mark as finished if requested
    if (markAsFinished) {
      participant.finished = true;
    }

    // Update positions for all participants
    this.updatePositions(shoot);

    // Save the updated shoot
    await this.repository.saveShoot(shoot);

    // Send notifications
    if (this.notificationService) {
      // Always send score update notification
      await this.notificationService.sendNotification(code, {
        type: NotificationType.SCORE_UPDATE,
        archerName,
        totalScore,
        arrowsShot,
        roundName,
        shoot: shoot
      });

      // Send position change notification if position changed
      if (previousPosition !== undefined &&
        participant.currentPosition !== undefined &&
        previousPosition !== participant.currentPosition) {

        await this.notificationService.sendNotification(code, {
          type: NotificationType.POSITION_CHANGE,
          archerName,
          previousPosition,
          currentPosition: participant.currentPosition,
          totalParticipants: shoot.participants.length,
          shoot: shoot
        });
      }

      // Send finished notification if this was a finish operation
      if (markAsFinished) {
        await this.notificationService.sendNotification(code, {
          type: NotificationType.ARCHER_FINISHED,
          archerName,
          totalScore,
          shoot: shoot
        });
      }
    }

    return { success: true, shoot };
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
  async cleanupExpiredShoots(): Promise<void> {
    // This would be implemented differently for different repository types
    // For now, we rely on the repository to handle expiration during getShootByCode
  }
}