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
  private maxConnections: number = 50; // Add connection limit
  private connectionCount: number = 0;

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
      // Check connection limit
      if (this.connectionCount >= this.maxConnections) {
        console.log('� Connection limit reached, rejecting new connection');
        ws.close(1008, 'Server at capacity');
        return;
      }

      this.connectionCount++;
      console.log(`�🔗 New WebSocket connection from: ${request.socket.remoteAddress} (${this.connectionCount}/${this.maxConnections})`);

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
        this.connectionCount--;
        console.log(`🔌 WebSocket client disconnected (${this.connectionCount}/${this.maxConnections})`);
      });

      client.on('error', (error) => {
        console.error('❌ WebSocket client error:', error);
        this.connectionCount--; // Ensure we decrement on error too
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
          this.connectionCount--; // Decrement when we terminate
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
      
      // Sync the connection count with actual clients (safety check)
      const actualCount = this.wss.clients.size;
      if (this.connectionCount !== actualCount) {
        console.warn(`⚠️ Connection count mismatch! Tracked: ${this.connectionCount}, Actual: ${actualCount}. Syncing...`);
        this.connectionCount = actualCount;
      }
    }, 60000); // Ping every 60 seconds (increased from 30)

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

  // Method to get connection stats
  getConnectionStats(): { total: number, max: number, shoots: Record<string, number>, debug?: any } {
    const shootSubscriptions: Record<string, number> = {}
    const actualConnections = this.wss.clients.size
    const readyStates: Record<number, number> = {}
    
    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as WebSocketClient
      
      // Count by ready state
      readyStates[client.readyState] = (readyStates[client.readyState] || 0) + 1
      
      // Only count subscriptions for OPEN connections
      if (client.readyState === WebSocket.OPEN) {
        client.subscribedShoots.forEach(shootCode => {
          shootSubscriptions[shootCode] = (shootSubscriptions[shootCode] || 0) + 1
        })
      }
    })

    return {
      total: this.connectionCount,
      max: this.maxConnections,
      shoots: shootSubscriptions,
      debug: {
        actualWsClients: actualConnections,
        readyStates: {
          [WebSocket.CONNECTING]: readyStates[WebSocket.CONNECTING] || 0,
          [WebSocket.OPEN]: readyStates[WebSocket.OPEN] || 0,
          [WebSocket.CLOSING]: readyStates[WebSocket.CLOSING] || 0,
          [WebSocket.CLOSED]: readyStates[WebSocket.CLOSED] || 0
        }
      }
    }
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