import { NotificationType } from '../ports/ShootNotificationService.js';
export class EndTrackingService {
    constructor(notificationService) {
        this.endCounts = new Map();
        this.notificationService = notificationService;
    }
    async trackEndCompletion(shoot, archerName) {
        // Initialize tracking for this shoot if needed
        if (!this.endCounts.has(shoot.code)) {
            this.endCounts.set(shoot.code, new Map());
        }
        const archerCounts = this.endCounts.get(shoot.code);
        // Initialize or increment end count for this archer
        const currentCount = archerCounts.get(archerName) || 0;
        archerCounts.set(archerName, currentCount + 1);
        // Check if we should send a notification (every 2 ends)
        if ((currentCount + 1) % 2 === 0) {
            const participant = shoot.participants.find(p => p.archerName === archerName);
            if (participant && participant.currentPosition !== undefined) {
                let positionChange;
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
    clearShootTracking(code) {
        this.endCounts.delete(code);
    }
}
