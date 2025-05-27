import { ShootNotification, ShootNotificationService } from '../ports/ShootNotificationService.js';

export class InMemoryShootNotificationService implements ShootNotificationService {
  private subscribers: Map<string, Array<(notification: ShootNotification) => void>> = new Map();
  private sentNotifications: Map<string, ShootNotification[]> = new Map();


  async sendNotification(code: string, notification: ShootNotification): Promise<void> {
    // Store the notification
    if (!this.sentNotifications.has(code)) {
      this.sentNotifications.set(code, []);
    }
    this.sentNotifications.get(code)!.push(notification);

    // Notify subscribers
    const callbacks = this.subscribers.get(code);
    if (callbacks) {
      callbacks.forEach(callback => callback(notification));
    }
  }

  // Method to get notifications sent for a specific shoot
  getNotificationsForShoot(code: string): ShootNotification[] {
    return this.sentNotifications.get(code) || [];
  }

  // Method to clear notifications for testing
  clearNotifications(code?: string): void {
    if (code) {
      this.sentNotifications.delete(code);
    } else {
      this.sentNotifications.clear();
    }
  }
}