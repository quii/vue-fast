import { Shoot } from '../models/Shoot.js';
import { ShootNotificationService, NotificationType } from '../ports/ShootNotificationService.js';

export class EndTrackingService {
  private endCounts: Map<string, Map<string, number>> = new Map();
  private notificationService: ShootNotificationService;

  constructor(notificationService: ShootNotificationService) {
    this.notificationService = notificationService;
  }

  async trackEndCompletion(shoot: Shoot, archerName: string): Promise<void> {
    // Initialize tracking for this shoot if needed
    if (!this.endCounts.has(shoot.code)) {
      this.endCounts.set(shoot.code, new Map());
    }

    const archerCounts = this.endCounts.get(shoot.code)!;

    // Initialize or increment end count for this archer
    const currentCount = archerCounts.get(archerName) || 0;
    archerCounts.set(archerName, currentCount + 1);

    // Check if we should send a notification (every 2 ends)
    if ((currentCount + 1) % 2 === 0) {
      const participant = shoot.participants.find(p => p.archerName === archerName);

      if (participant && participant.currentPosition !== undefined) {
        let positionChange: number | undefined;

        if (participant.previousPosition !== undefined) {
          positionChange = participant.previousPosition - participant.currentPosition;
        }

        await this.notificationService.sendNotification(shoot.code, {
          type: NotificationType.END_COMPLETE,
          archerName,
          currentPosition: participant.currentPosition,
          totalParticipants: shoot.participants.length,
          positionChange
        });
      }
    }
  }

  clearShootTracking(code: string): void {
    this.endCounts.delete(code);
  }
}