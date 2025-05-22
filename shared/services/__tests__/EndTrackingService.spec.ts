import { describe, expect, beforeEach, it } from 'vitest';
import { EndTrackingService } from '../EndTrackingService.js';
import { InMemoryShootNotificationService } from '../InMemoryShootNotificationService.js';
import { Shoot } from '../../models/Shoot.js';
import { NotificationType, EndCompleteNotification } from '../../ports/ShootNotificationService.js';

describe('EndTrackingService', () => {
  let endTrackingService: EndTrackingService;
  let notificationService: InMemoryShootNotificationService;
  let mockShoot: Shoot;

  beforeEach(() => {
    notificationService = new InMemoryShootNotificationService();
    endTrackingService = new EndTrackingService(notificationService);

    mockShoot = {
      id: 'test-shoot',
      code: '1234',
      creatorName: 'Creator',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000), // Tomorrow
      participants: [
        {
          id: 'p1',
          archerName: 'Archer 1',
          roundName: 'Windsor',
          totalScore: 30,
          lastUpdated: new Date(),
          currentPosition: 2
        },
        {
          id: 'p2',
          archerName: 'Archer 2',
          roundName: 'Windsor',
          totalScore: 50,
          lastUpdated: new Date(),
          currentPosition: 1
        }
      ],
      lastUpdated: new Date()
    };

    // Clear any existing notifications
    notificationService.clearNotifications();
  });

  it('tracks end completions and sends notifications every 2 ends', async () => {
    // First end - no notification
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');
    let notifications = notificationService.getNotificationsForShoot('1234');
    expect(notifications.length).toBe(0);

    // Second end - should send notification
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');
    notifications = notificationService.getNotificationsForShoot('1234');
    expect(notifications.length).toBe(1);

    const notification = notifications[0];
    expect(notification.type).toBe(NotificationType.END_COMPLETE);
    expect(notification.archerName).toBe('Archer 1');

    // After verifying type, use type assertion
    const endNotification = notification as EndCompleteNotification;
    expect(endNotification.currentPosition).toBe(2);
    expect(endNotification.totalParticipants).toBe(2);

    // Clear notifications
    notificationService.clearNotifications('1234');

    // Third end - no notification
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');
    notifications = notificationService.getNotificationsForShoot('1234');
    expect(notifications.length).toBe(0);

    // Fourth end - should send notification
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');
    notifications = notificationService.getNotificationsForShoot('1234');
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe(NotificationType.END_COMPLETE);
    expect(notifications[0].archerName).toBe('Archer 1');
  });

  it('includes position change in notifications when available', async () => {
    // Set previous position
    mockShoot.participants[0].previousPosition = 3;

    // First end - no notification
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');

    // Second end - should send notification with position change
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');

    const notifications = notificationService.getNotificationsForShoot('1234');
    expect(notifications.length).toBe(1);

    const notification = notifications[0];
    expect(notification.type).toBe(NotificationType.END_COMPLETE);
    expect(notification.archerName).toBe('Archer 1');

    // After verifying type, use type assertion
    const endNotification = notification as EndCompleteNotification;
    expect(endNotification.positionChange).toBe(1); // Moved up from position 3 to 2
  });

  it('clears tracking data for a shoot', async () => {
    // Track one end
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');

    // Clear tracking
    endTrackingService.clearShootTracking('1234');

    // Track another end - should not trigger notification yet
    await endTrackingService.trackEndCompletion(mockShoot, 'Archer 1');

    const notifications = notificationService.getNotificationsForShoot('1234');
    expect(notifications.length).toBe(0);
  });
});