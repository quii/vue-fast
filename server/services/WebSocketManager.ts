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
    // Create WebSocket server with explicit path
    this.wss = new WebSocketServer({
      server,
      path: '/ws' // Add explicit path
    });
    console.log('🔌 WebSocket server created on path /ws');
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('🔗 New WebSocket connection from:', request.socket.remoteAddress);

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
          console.log('📨 Received WebSocket message:', message);
          const parsedMessage = JSON.parse(message) as WebSocketMessage;
          this.handleMessage(client, parsedMessage);
        } catch (error) {
          console.error('❌ Error handling WebSocket message:', error);
          this.sendErrorMessage(client, 'Invalid message format');
        }
      });

      // Handle client disconnection
      client.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
      });

      client.on('error', (error) => {
        console.error('❌ WebSocket client error:', error);
      });

      // Send welcome message
      this.sendMessage(client, {
        type: 'update',
        data: { message: 'Connected to Fast Archery WebSocket Server' }
      });
    });

    this.wss.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });

    // Set up ping interval to keep connections alive and detect dead connections
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as WebSocketClient;
        if (client.isAlive === false) {
          console.log('💀 Terminating dead WebSocket connection');
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000); // Ping every 30 seconds

    console.log('✅ WebSocket server initialized with ping interval');
  }

  private handleMessage(client: WebSocketClient, message: WebSocketMessage): void {
    console.log('🎯 Handling message:', message.type, 'for shoot:', message.shootCode);

    switch (message.type) {
      case 'subscribe':
        if (message.shootCode) {
          client.subscribedShoots.add(message.shootCode);
          console.log(`✅ Client subscribed to shoot: ${message.shootCode}`);
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
          console.log(`❌ Client unsubscribed from shoot: ${message.shootCode}`);
        }
        break;

      default:
        this.sendErrorMessage(client, `Unknown message type: ${message.type}`);
    }
  }

  private sendMessage(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log('📤 Sending message to client:', messageStr);
      client.send(messageStr);
    } else {
      console.log('⚠️ Cannot send message, client not ready. ReadyState:', client.readyState);
    }
  }

  private sendErrorMessage(client: WebSocketClient, errorMessage: string): void {
    console.log('🚨 Sending error message:', errorMessage);
    this.sendMessage(client, {
      type: 'update',
      data: { error: errorMessage }
    });
  }

  private broadcastToShoot(shootCode: string, message: WebSocketMessage): void {
    console.log(`📢 Broadcasting to shoot ${shootCode}:`, message.type);
    let sentCount = 0;

    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as WebSocketClient;
      if (client.readyState === WebSocket.OPEN && client.subscribedShoots.has(shootCode)) {
        client.send(JSON.stringify(message));
        sentCount++;
      }
    });

    console.log(`📊 Broadcast sent to ${sentCount} clients for shoot ${shootCode}`);
  }

  // ShootNotificationService implementation
  async sendNotification(shootCode: string, notification: ShootNotification): Promise<void> {
    console.log(`🔔 Sending notification for shoot ${shootCode}:`, notification);
    this.broadcastToShoot(shootCode, {
      type: 'notification',
      shootCode,
      data: notification
    });
  }

  // Method to broadcast shoot updates
  async broadcastShootUpdate(shootCode: string, shootData: any): Promise<void> {
    console.log(`🔄 Broadcasting shoot update for ${shootCode}`);
    this.broadcastToShoot(shootCode, {
      type: 'update',
      shootCode,
      data: { shoot: shootData }
    });
  }

  // Clean up resources
  close(): void {
    console.log('🧹 Closing WebSocket server...');

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.wss.close();
    console.log('✅ WebSocket server closed');
  }
}