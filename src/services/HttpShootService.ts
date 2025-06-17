import { ShootService } from '../../shared/ports/ShootService.js'
import { Shoot } from '../../shared/models/Shoot.js'

/**
 * HTTP implementation of ShootService for client-side use
 * Delegates all operations to the server's HTTP API
 */
export class HttpShootService implements ShootService {
  private baseUrl: string
  private retryCount: number
  private retryDelay: number
  private connectionStatus: 'online' | 'offline' = 'online'
  private pendingOperations: Array<() => Promise<any>> = []

  constructor(baseUrl: string = '/api/shoots', retryCount: number = 3, retryDelay: number = 1000) {
    this.baseUrl = baseUrl
    this.retryCount = retryCount
    this.retryDelay = retryDelay

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
      this.connectionStatus = navigator.onLine ? 'online' : 'offline'
    }
  }

  /**
   * Handles browser coming back online
   */
  private async handleOnline() {
    console.log('Connection restored, processing pending operations')
    this.connectionStatus = 'online'

    // Process any pending operations
    const operations = [...this.pendingOperations]
    this.pendingOperations = []

    for (const operation of operations) {
      try {
        await operation()
      } catch (error) {
        console.error('Failed to process pending operation:', error)
      }
    }
  }

  /**
   * Handles browser going offline
   */
  private handleOffline() {
    console.log('Connection lost, operations will be queued')
    this.connectionStatus = 'offline'
  }

  /**
   * Performs a fetch request with retry logic
   */
  private async fetchWithRetry(url: string, options: RequestInit, retries = this.retryCount): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        // Ensure keep-alive is used
        keepalive: true,
        // Add cache control headers to prevent caching
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok && retries > 0) {
        console.log(`Request failed with status ${response.status}, retrying... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.fetchWithRetry(url, options, retries - 1)
      }

      return response
    } catch (error) {
      if (retries > 0) {
        console.log(`Network error, retrying... (${retries} retries left)`, error)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.fetchWithRetry(url, options, retries - 1)
      }

      // If we're offline, queue the operation for later
      if (this.connectionStatus === 'offline') {
        console.log('Device is offline, queueing operation for later')
        this.pendingOperations.push(() => this.fetchWithRetry(url, options))
      }

      throw error
    }
  }

  /**
   * Creates a new shoot via HTTP POST
   */
  async createShoot(creatorName: string): Promise<{ shoot: Shoot; code: string }> {
    try {
      console.log('Creating shoot with:', { creatorName });

      const response = await this.fetchWithRetry(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorName }),
      })

      console.log('Create response status:', response.status);
      console.log('Create response headers:', response.headers);

      const data = await response.json()
      console.log('Create response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to create shoot')
      }

      return {
        shoot: data.shoot,
        code: data.code
      }
    } catch (error) {
      console.error('Create shoot error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Joins an existing shoot via HTTP POST
   */
  async joinShoot(code: string, archerName: string, roundName: string): Promise<{ success: boolean; shoot?: Shoot }> {
    try {
      console.log('Joining shoot with:', { code, archerName, roundName });

      const response = await this.fetchWithRetry(`${this.baseUrl}/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, roundName }),
      })

      console.log('Join response status:', response.status);
      console.log('Join response headers:', response.headers);

      if (response.status === 404) {
        return { success: false }
      }

      const data = await response.json()
      console.log('Join response data:', data);
      return data
    } catch (error) {
      console.error('Join shoot error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Updates an archer's score via HTTP PUT
   */
  async updateScore(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification?: string): Promise<{ success: boolean; shoot?: Shoot }> {
    try {
      console.log('Updating score with:', { code, archerName, totalScore, roundName, arrowsShot, currentClassification });

      const response = await this.fetchWithRetry(`${this.baseUrl}/${code}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, totalScore, roundName, arrowsShot, currentClassification }),
      })

      if (response.status === 404) {
        console.log('Shoot not found or update failed');
        console.log(response)
        return { success: false }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update score error response:', errorText);
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update score error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Finishes an archer's shoot via HTTP PUT
   */
  async finishShoot(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification?: string): Promise<{ success: boolean; shoot?: Shoot }> {
    try {
      console.log('Finishing shoot with:', { code, archerName, totalScore, roundName, arrowsShot, currentClassification });

      const response = await this.fetchWithRetry(`${this.baseUrl}/${code}/finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, totalScore, roundName, arrowsShot, currentClassification }),
      })

      console.log('Finish shoot response status:', response.status);

      if (response.status === 404) {
        return { success: false }
      }

      const data = await response.json()
      console.log('Finish shoot response data:', data);
      return data
    } catch (error) {
      console.error('Finish shoot error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Removes an archer from a shoot via HTTP DELETE
   */
  async leaveShoot(code: string, archerName: string): Promise<{ success: boolean }> {
    try {
      console.log('Leaving shoot with:', { code, archerName });

      const response = await this.fetchWithRetry(`${this.baseUrl}/${code}/archer/${encodeURIComponent(archerName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Leave shoot response status:', response.status);

      if (response.status === 404) {
        return { success: false }
      }

      const data = await response.json()
      console.log('Leave shoot response data:', data);
      return data
    } catch (error) {
      console.error('Leave shoot error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Gets the current state of a shoot via HTTP GET
   */
  async getShoot(code: string): Promise<Shoot | null> {
    try {
      console.log('Getting shoot with code:', code);

      const response = await this.fetchWithRetry(`${this.baseUrl}/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Get shoot response status:', response.status);

      if (response.status === 404) {
        return null
      }

      const data = await response.json()
      console.log('Get shoot response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to get shoot')
      }

      return data.shoot
    } catch (error) {
      console.error('Get shoot error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Checks if a shoot exists and is still active
   */
  async shootExists(code: string): Promise<boolean> {
    try {
      const shoot = await this.getShoot(code)
      return shoot !== null
    } catch (error) {
      return false
    }
  }
}