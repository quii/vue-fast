export class InMemoryShootNotificationService {
    constructor() {
        this.subscribers = new Map();
        this.sentNotifications = new Map();
    }
    async sendNotification(code, notification) {
        // Store the notification
        if (!this.sentNotifications.has(code)) {
            this.sentNotifications.set(code, []);
        }
        this.sentNotifications.get(code).push(notification);
        // Notify subscribers
        const callbacks = this.subscribers.get(code);
        if (callbacks) {
            callbacks.forEach(callback => callback(notification));
        }
    }
    // Method to get notifications sent for a specific shoot
    getNotificationsForShoot(code) {
        return this.sentNotifications.get(code) || [];
    }
    // Method to clear notifications for testing
    clearNotifications(code) {
        if (code) {
            this.sentNotifications.delete(code);
        }
        else {
            this.sentNotifications.clear();
        }
    }
}
