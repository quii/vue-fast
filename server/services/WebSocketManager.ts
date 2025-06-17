import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { ShootNotification, ShootNotificationService } from '../../shared/ports/ShootNotificationService.js'
import { ShootService } from '../../shared/ports/ShootService.js'

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'notification' | 'update-score' | 'join-shoot' | 'response' | 'error'
  shootCode?: string
  requestId?: string
  data?: any
}

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  subscribedShoots: Set<string>;
}

//todo: This should just implement ShootService, and then we can remove the HTTP version
export class WebSocketManager implements ShootNotificationService {
  private wss: WebSocketServer;
  private pingInterval: NodeJS.Timeout | null = null;
  private shootService: ShootService | null = null;

  constructor(server: Server) {
    // Create WebSocket server with explicit path
    this.wss = new WebSocketServer({
      server,
      path: '/ws' // Add explicit path
    });
    console.log('🔌 WebSocket server created on path /ws');
    this.initialize();
  }

  // Method to set the ShootService after initialization
  setShootService(service: ShootService): void {
    this.shootService = service;
    console.log('✅ ShootService set in WebSocketManager');
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
      client.on('message', async (message: string) => {
        try {
          const parsedMessage = JSON.parse(message) as WebSocketMessage;
          await this.handleMessage(client, parsedMessage);
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

  private async handleMessage(client: WebSocketClient, message: WebSocketMessage): Promise<void> {
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

      case 'update-score':
        // Check if ShootService is available
        if (!this.shootService) {
          this.sendErrorResponse(client, message.requestId, 'ShootService not initialized');
          return;
        }
        await this.handleUpdateScore(client, message);
        break;

      case 'join-shoot':
        // Check if ShootService is available
        if (!this.shootService) {
          this.sendErrorResponse(client, message.requestId, 'ShootService not initialized');
          return;
        }
        await this.handleJoinShoot(client, message);
        break;

      default:
        this.sendErrorMessage(client, `Unknown message type: ${message.type}`);
    }
  }

  private async handleUpdateScore(client: WebSocketClient, message: WebSocketMessage): Promise<void> {
    if (!message.shootCode || !message.data || !this.shootService) {
      this.sendErrorResponse(client, message.requestId, 'Missing shootCode, data, or ShootService');
      return;
    }

    const { archerName, totalScore, roundName, arrowsShot, currentClassification } = message.data;

    // Validate required fields
    if (!archerName || totalScore === undefined || !roundName || arrowsShot === undefined) {
      this.sendErrorResponse(client, message.requestId, 'Archer name, total score, round name, and arrows shot are required');
      return;
    }

    // Validate that arrowsShot is a non-negative number
    if (typeof arrowsShot !== 'number' || arrowsShot < 0) {
      this.sendErrorResponse(client, message.requestId, 'Arrows shot must be a non-negative number');
      return;
    }

    // Validate that totalScore is a number
    if (typeof totalScore !== 'number') {
      this.sendErrorResponse(client, message.requestId, 'Total score must be a number');
      return;
    }

    try {
      // Use the ShootService to update the score
      const result = await this.shootService.updateScore(
        message.shootCode,
        archerName,
        totalScore,
        roundName,
        arrowsShot,
        currentClassification
      );

      // Send response back to the client
      this.sendMessage(client, {
        type: 'response',
        requestId: message.requestId,
        data: result
      });

      // No need to broadcast here as ShootService already does that through this WebSocketManager
    } catch (error) {
      console.error('❌ Error updating score:', error);
      this.sendErrorResponse(client, message.requestId, 'Failed to update score');
    }
  }

  private async handleJoinShoot(client: WebSocketClient, message: WebSocketMessage): Promise<void> {
    if (!message.shootCode || !message.data || !this.shootService) {
      this.sendErrorResponse(client, message.requestId, 'Missing shootCode, data, or ShootService');
      return;
    }

    const { archerName, roundName } = message.data;

    // Validate required fields
    if (!archerName || !roundName) {
      this.sendErrorResponse(client, message.requestId, 'Archer name and round name are required');
      return;
    }

    try {
      // Use the ShootService to join the shoot
      const result = await this.shootService.joinShoot(
        message.shootCode,
        archerName,
        roundName
      );

      // Send response back to the client
      this.sendMessage(client, {
        type: 'response',
        requestId: message.requestId,
        data: result
      });

      // No need to broadcast here as ShootService already does that through this WebSocketManager
    } catch (error) {
      console.error('❌ Error joining shoot:', error);
      this.sendErrorResponse(client, message.requestId, 'Failed to join shoot');
    }
  }

  private sendMessage(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      client.send(messageStr);
    } else {
      console.log('⚠️ Cannot send message, client not ready. ReadyState:', client.readyState);
    }
  }

  private sendErrorMessage(client: WebSocketClient, errorMessage: string): void {
    this.sendMessage(client, {
      type: 'update',
      data: { error: errorMessage }
    });
  }

  private sendErrorResponse(client: WebSocketClient, requestId: string | undefined, errorMessage: string): void {
    if (!requestId) return;

    this.sendMessage(client, {
      type: 'error',
      requestId,
      data: { message: errorMessage }
    });
  }

  private broadcastToShoot(shootCode: string, message: WebSocketMessage): void {
    let sentCount = 0;

    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as WebSocketClient;
      if (client.readyState === WebSocket.OPEN && client.subscribedShoots.has(shootCode)) {
        client.send(JSON.stringify(message));
        sentCount++;
      }
    });

    console.log(`📊 Broadcast to ${sentCount} clients for shoot ${shootCode}`);
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
    console.log('✅ WebSocket server closed');
  }
}