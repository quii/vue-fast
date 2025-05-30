import { ShootService } from '../../shared/ports/ShootService.js'
import { Shoot } from '../../shared/models/Shoot.js'

/**
 * HTTP implementation of ShootService for client-side use
 * Delegates all operations to the server's HTTP API
 */
export class HttpShootService implements ShootService {
  private baseUrl: string

  constructor(baseUrl: string = '/api/shoots') {
    this.baseUrl = baseUrl
  }

  /**
   * Creates a new shoot via HTTP POST
   */
  async createShoot(creatorName: string): Promise<{ shoot: Shoot; code: string }> {
    try {
      console.log('Creating shoot with:', { creatorName });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorName }),
      })

      console.log('Create response status:', response.status);
      console.log('Create response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Create error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`)
      }

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

      const response = await fetch(`${this.baseUrl}/${code}/join`, {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Join error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`)
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
  async updateScore(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number): Promise<{ success: boolean; shoot?: Shoot }> {
    try {
      console.log('Updating score with:', { code, archerName, totalScore, roundName, arrowsShot });

      const response = await fetch(`${this.baseUrl}/${code}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, totalScore, roundName, arrowsShot }),
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
  async finishShoot(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number): Promise<{ success: boolean; shoot?: Shoot }> {
    try {
      console.log('Finishing shoot with:', { code, archerName, totalScore, roundName, arrowsShot });

      const response = await fetch(`${this.baseUrl}/${code}/finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archerName, totalScore, roundName, arrowsShot }),
      })

      console.log('Finish shoot response status:', response.status);

      if (response.status === 404) {
        return { success: false }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Finish shoot error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`)
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

      const response = await fetch(`${this.baseUrl}/${code}/archer/${encodeURIComponent(archerName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Leave shoot response status:', response.status);

      if (response.status === 404) {
        return { success: false }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Leave shoot error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`)
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

      const response = await fetch(`${this.baseUrl}/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Get shoot response status:', response.status);

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Get shoot error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`)
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