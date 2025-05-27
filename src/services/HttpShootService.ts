import { ShootService } from '../../shared/ports/ShootService.js'
import { Shoot } from '../../shared/models/Shoot.js'

/**
 * HTTP implementation of ShootService for client-side use
 * Delegates all operations to the server's HTTP API
 */
export class HttpShootService implements ShootService {
  private baseUrl: string

  constructor(baseUrl: string = '/api/leaderboard') {
    this.baseUrl = baseUrl
  }

  /**
   * Creates a new shoot via HTTP POST
   */
  async createShoot(creatorName: string): Promise<{ shoot: Shoot; code: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create shoot')
      }

      return {
        shoot: data.shoot,
        code: data.code
      }
    } catch (error) {
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
      const response = await fetch(`${this.baseUrl}/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, roundName }),
      })

      if (response.status === 404) {
        return { success: false }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  /**
   * Updates an archer's score via HTTP PUT
   */
  async updateScore(code: string, archerName: string, totalScore: number, roundName: string): Promise<{ success: boolean; shoot?: Shoot }> {
    try {
      const response = await fetch(`${this.baseUrl}/${code}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, totalScore, roundName }),
      })

      if (response.status === 404) {
        return { success: false }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
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
      const response = await fetch(`${this.baseUrl}/${code}/archer/${encodeURIComponent(archerName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 404) {
        return { success: false }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
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
      const response = await fetch(`${this.baseUrl}/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to get shoot')
      }

      return data.shoot
    } catch (error) {
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