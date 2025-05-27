import { ShootNotificationService, ShootNotification } from '../../shared/ports/ShootNotificationService.js'

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'notification'
  shootCode?: string
  data?: any
}

/**
 * Client-side WebSocket service for receiving real-time shoot notifications
 */
export class WebSocketNotificationService extends EventTarget implements ShootNotificationService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private subscribedShoots: Set<string> = new Set()

  constructor(url?: string) {
    super() // Call EventTarget constructor

    // Default to current host with ws/wss protocol and /ws path
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    this.url = url || `${protocol}//${window.location.host}/ws`
    console.log('🔧 WebSocket service created with URL:', this.url)
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    console.log('🚀 Attempting to connect to WebSocket at:', this.url)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        console.log('📡 WebSocket object created, readyState:', this.ws.readyState)

        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          console.error('⏰ WebSocket connection timeout after 10 seconds')
          if (this.ws) {
            this.ws.close()
          }
          reject(new Error('WebSocket connection timeout'))
        }, 10000)

        this.ws.onopen = () => {
          console.log('✅ WebSocket onopen event fired')
          clearTimeout(connectionTimeout)
          this.reconnectAttempts = 0

          // Re-subscribe to any shoots we were subscribed to
          this.subscribedShoots.forEach(shootCode => {
            console.log('🔄 Re-subscribing to shoot:', shootCode)
            this.subscribeToShoot(shootCode)
          })

          // Emit connection event
          this.dispatchEvent(new CustomEvent('websocket-connected'))

          resolve()
        }

        this.ws.onmessage = (event) => {
          console.log('📨 WebSocket message received:', event.data)
          try {
            const message = JSON.parse(event.data) as WebSocketMessage
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket onclose event fired. Code:', event.code, 'Reason:', event.reason)
          clearTimeout(connectionTimeout)
          this.ws = null

          // Emit disconnection event
          this.dispatchEvent(new CustomEvent('websocket-disconnected', {
            detail: { code: event.code, reason: event.reason }
          }))

          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket onerror event fired:', error)
          clearTimeout(connectionTimeout)

          // Emit error event
          this.dispatchEvent(new CustomEvent('websocket-error', {
            detail: { error }
          }))

          reject(error)
        }

        // Log readyState changes
        const checkReadyState = () => {
          if (this.ws) {
            console.log('📊 WebSocket readyState:', this.ws.readyState, this.getReadyStateString(this.ws.readyState))
            if (this.ws.readyState === WebSocket.CONNECTING) {
              setTimeout(checkReadyState, 1000)
            }
          }
        }
        checkReadyState()

      } catch (error) {
        console.error('❌ Error creating WebSocket:', error)
        reject(error)
      }
    })
  }

  private getReadyStateString(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING'
      case WebSocket.OPEN: return 'OPEN'
      case WebSocket.CLOSING: return 'CLOSING'
      case WebSocket.CLOSED: return 'CLOSED'
      default: return 'UNKNOWN'
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribedShoots.clear()
  }

  /**
   * Subscribe to notifications for a specific shoot
   */
  subscribeToShoot(shootCode: string): void {
    this.subscribedShoots.add(shootCode)

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'subscribe',
        shootCode
      }
      this.ws.send(JSON.stringify(message))
      console.log('📤 Subscribed to shoot:', shootCode)
    }
  }

  /**
   * Unsubscribe from notifications for a specific shoot
   */
  unsubscribeFromShoot(shootCode: string): void {
    this.subscribedShoots.delete(shootCode)

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'unsubscribe',
        shootCode
      }
      this.ws.send(JSON.stringify(message))
      console.log('📤 Unsubscribed from shoot:', shootCode)
    }
  }

  /**
   * Implementation of ShootNotificationService interface
   * Note: Client-side doesn't send notifications, only receives them
   */
  async sendNotification(shootCode: string, notification: ShootNotification): Promise<void> {
    // Client-side doesn't send notifications - this is handled by the server
    console.warn('Client-side WebSocket service cannot send notifications')
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('🎯 Handling WebSocket message:', message.type, 'for shoot:', message.shootCode)

    switch (message.type) {
      case 'notification':
        if (message.shootCode && message.data) {
          console.log('🔔 Emitting shoot-notification event:', message.data)
          // Emit notification event
          this.dispatchEvent(new CustomEvent('shoot-notification', {
            detail: {
              shootCode: message.shootCode,
              notification: message.data as ShootNotification
            }
          }))
        }
        break

      case 'update':
        if (message.shootCode && message.data?.shoot) {
          console.log('🔄 Emitting shoot-updated event for shoot:', message.shootCode)
          // Emit shoot update event
          this.dispatchEvent(new CustomEvent('shoot-updated', {
            detail: {
              shootCode: message.shootCode,
              shoot: message.data.shoot
            }
          }))
        }
        break

      case 'subscribe':
      case 'unsubscribe':
        // Acknowledgment messages - could log for debugging
        console.log(`WebSocket: ${message.type} acknowledged for ${message.shootCode}`)
        break

      default:
        console.log('WebSocket message:', message)
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.dispatchEvent(new CustomEvent('websocket-reconnect-failed'))
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.dispatchEvent(new CustomEvent('websocket-reconnecting', {
      detail: { attempt: this.reconnectAttempts, delay }
    }))

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Get list of subscribed shoots
   */
  getSubscribedShoots(): string[] {
    return Array.from(this.subscribedShoots)
  }
}