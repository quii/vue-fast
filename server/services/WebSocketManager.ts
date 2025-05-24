import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { ShootNotification, ShootNotificationService } from '../../shared/ports/ShootNotificationService.js'

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'notification';
  shootCode?: string;
  data?: any;
}

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  subscribedShoots: Set<string>;
}

export class WebSocketManager implements ShootNotificationService {
  private wss: WebSocketServer;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const client = ws as WebSocketClient;
      client.isAlive = true;
      client.subscribedShoots = new Set();

      // Handle pong messages
      client.on('pong', () => {
        client.isAlive = true;
      });

      // Handle messages from clients
      client.on('message', (message: string) => {
        try {
          const parsedMessage = JSON.parse(message) as WebSocketMessage;
          this.handleMessage(client, parsedMessage);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.sendErrorMessage(client, 'Invalid message format');
        }
      });

      // Handle client disconnection
      client.on('close', () => {
        console.log('Client disconnected');
      });

      // Send welcome message
      this.sendMessage(client, {
        type: 'update',
        data: { message: 'Connected to Fast Archery WebSocket Server' }
      });
    });

    // Set up ping interval to keep connections alive and detect dead connections
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as WebSocketClient;
        if (client.isAlive === false) {
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000); // Ping every 30 seconds
  }

  private handleMessage(client: WebSocketClient, message: WebSocketMessage): void {
    switch (message.type) {
      case 'subscribe':
        if (message.shootCode) {
          client.subscribedShoots.add(message.shootCode);
          console.log(`Client subscribed to shoot: ${message.shootCode}`);
          this.sendMessage(client, {
            type: 'update',
            shootCode: message.shootCode,
            data: { message: `Subscribed to shoot ${message.shootCode}` }
          });
        }
        break;

      case 'unsubscribe':
        if (message.shootCode) {
          client.subscribedShoots.delete(message.shootCode);
          console.log(`Client unsubscribed from shoot: ${message.shootCode}`);
        }
        break;

      default:
        this.sendErrorMessage(client, `Unknown message type: ${message.type}`);
    }
  }

  private sendMessage(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private sendErrorMessage(client: WebSocketClient, errorMessage: string): void {
    this.sendMessage(client, {
      type: 'update',
      data: { error: errorMessage }
    });
  }

  private broadcastToShoot(shootCode: string, message: WebSocketMessage): void {
    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as WebSocketClient;
      if (client.readyState === WebSocket.OPEN && client.subscribedShoots.has(shootCode)) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // ShootNotificationService implementation
  async sendNotification(shootCode: string, notification: ShootNotification): Promise<void> {
    this.broadcastToShoot(shootCode, {
      type: 'notification',
      shootCode,
      data: notification
    });
  }

  // Method to broadcast shoot updates
  async broadcastShootUpdate(shootCode: string, shootData: any): Promise<void> {
    this.broadcastToShoot(shootCode, {
      type: 'update',
      shootCode,
      data: { shoot: shootData }
    });
  }

  // Clean up resources
  close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.wss.close();
  }
}