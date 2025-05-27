import { describe, expect, beforeEach, it } from 'vitest';
import { ShootServiceImpl } from '../ShootServiceImpl.js';
import { InMemoryShootNotificationService } from '../InMemoryShootNotificationService.js';
import { NotificationType, PositionChangeNotification } from '../../ports/ShootNotificationService.js';
import { InMemoryShootRepository } from '../InMemoryShootRepository.js'

describe('ShootService', () => {
  let shootService: ShootServiceImpl;
  let repository: InMemoryShootRepository;
  let notificationService: InMemoryShootNotificationService;

  beforeEach(() => {
    repository = new InMemoryShootRepository();
    notificationService = new InMemoryShootNotificationService();
    shootService = new ShootServiceImpl(repository, notificationService);
  });

  it('creates a shoot with a valid code', async () => {
    const { shoot, code } = await shootService.createShoot('Archer 1');

    expect(shoot.creatorName).toBe('Archer 1');
    expect(code).toMatch(/^\d{4}$/);
    expect(shoot.participants).toHaveLength(0);

    // Shoot should expire at the end of the day
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    expect(shoot.expiresAt.getDate()).toBe(endOfDay.getDate());
    expect(shoot.expiresAt.getMonth()).toBe(endOfDay.getMonth());
    expect(shoot.expiresAt.getFullYear()).toBe(endOfDay.getFullYear());
  });

  it('allows archers to join a shoot', async () => {
    const { code } = await shootService.createShoot('Archer 1');

    const result = await shootService.joinShoot(code, 'Archer 2', 'Windsor');

    expect(result.success).toBe(true);
    expect(result.shoot?.participants).toHaveLength(1);
    expect(result.shoot?.participants[0].archerName).toBe('Archer 2');
    expect(result.shoot?.participants[0].roundName).toBe('Windsor');
    expect(result.shoot?.participants[0].totalScore).toBe(0);
  });

  it('updates an archer\'s score', async () => {
    const { code } = await shootService.createShoot('Archer 1');
    await shootService.joinShoot(code, 'Archer 2', 'Windsor');

    const result = await shootService.updateScore(code, 'Archer 2', 42, 'Windsor');

    expect(result.success).toBe(true);
    expect(result.shoot?.participants[0].totalScore).toBe(42);
  });

  it('updates positions when scores change', async () => {
    const { code } = await shootService.createShoot('Creator');
    await shootService.joinShoot(code, 'Archer 1', 'Windsor');
    await shootService.joinShoot(code, 'Archer 2', 'Windsor');
    await shootService.joinShoot(code, 'Archer 3', 'Windsor');

    // Initial scores
    await shootService.updateScore(code, 'Archer 1', 30, 'Windsor');
    await shootService.updateScore(code, 'Archer 2', 50, 'Windsor');
    await shootService.updateScore(code, 'Archer 3', 40, 'Windsor');

    const shoot = await shootService.getShoot(code);

    // Check positions
    const archer1 = shoot!.participants.find(p => p.archerName === 'Archer 1');
    const archer2 = shoot!.participants.find(p => p.archerName === 'Archer 2');
    const archer3 = shoot!.participants.find(p => p.archerName === 'Archer 3');

    expect(archer1!.currentPosition).toBe(3); // Lowest score
    expect(archer2!.currentPosition).toBe(1); // Highest score
    expect(archer3!.currentPosition).toBe(2); // Middle score

    // Update scores to change positions
    await shootService.updateScore(code, 'Archer 1', 60, 'Windsor');

    const updatedShoot = await shootService.getShoot(code);
    const updatedArcher1 = updatedShoot!.participants.find(p => p.archerName === 'Archer 1');

    expect(updatedArcher1!.currentPosition).toBe(1); // Now highest score
    expect(updatedArcher1!.previousPosition).toBe(3); // Was lowest
  });

  it('sends notifications when positions change', async () => {
    const { code } = await shootService.createShoot('Creator');
    await shootService.joinShoot(code, 'Archer 1', 'Windsor');
    await shootService.joinShoot(code, 'Archer 2', 'Windsor');

    // Initial scores
    await shootService.updateScore(code, 'Archer 1', 30, 'Windsor');
    await shootService.updateScore(code, 'Archer 2', 50, 'Windsor');

    // Clear any notifications sent during setup
    notificationService.clearNotifications(code);

    // Change score to trigger position change
    await shootService.updateScore(code, 'Archer 1', 60, 'Windsor');

    // Get notifications sent for this shoot
    const notifications = notificationService.getNotificationsForShoot(code);

    // Find position change notification
    const positionChangeNotification = notifications.find(
      n => n.type === NotificationType.POSITION_CHANGE && n.archerName === 'Archer 1'
    );

    expect(positionChangeNotification).toBeDefined();
    expect(positionChangeNotification?.type).toBe(NotificationType.POSITION_CHANGE);
    expect(positionChangeNotification?.archerName).toBe('Archer 1');

    // After verifying type, use type assertion
    const typedNotification = positionChangeNotification as PositionChangeNotification;
    expect(typedNotification.previousPosition).toBe(2);
    expect(typedNotification.currentPosition).toBe(1);
  });

  it('allows archers to leave a shoot', async () => {
    const { code } = await shootService.createShoot('Creator');
    await shootService.joinShoot(code, 'Archer 1', 'Windsor');

    // Add a small delay to ensure operations complete
    await new Promise(resolve => setTimeout(resolve, 10));

    let shoot = await shootService.getShoot(code);
    expect(shoot!.participants).toHaveLength(1);

    const result = await shootService.leaveShoot(code, 'Archer 1');
    expect(result.success).toBe(true);

    // Add a small delay to ensure operations complete
    await new Promise(resolve => setTimeout(resolve, 10));

    shoot = await shootService.getShoot(code);
    expect(shoot!.participants).toHaveLength(0);
  });

  it('handles non-existent shoots gracefully', async () => {
    const joinResult = await shootService.joinShoot('1234', 'Archer', 'Windsor');
    expect(joinResult.success).toBe(false);

    const updateResult = await shootService.updateScore('1234', 'Archer', 50, 'Windsor');
    expect(updateResult.success).toBe(false);

    const leaveResult = await shootService.leaveShoot('1234', 'Archer');
    expect(leaveResult.success).toBe(false);
  });
});