import { useInstallationStore } from '@/stores/installation'
import { useUserStore } from '@/stores/user'
import { useHistoryStore } from '@/stores/history'
import { useNotesStore } from '@/stores/user_notes'

// Constants
const BACKUP_RETRY_DELAYS = [2000, 5000, 10000, 30000] // Retry delays in ms (exponential backoff)
const BACKUP_ENDPOINT = '/api/backup'
const DEVICE_ID_STORAGE_KEY = 'archery-device-id'

// Interface for backup metadata
interface BackupMetadata {
  key: string;
  userName: string;
  deviceId: string;
  timestamp: string;
  size?: number;
  lastModified?: Date;
}

/**
 * Service for handling cloud backups
 */
export const backupService = {
  /**
   * Check if cloud backup is enabled
   * Cloud backup is only available when the app is installed as a PWA
   */
  isEnabled(): boolean {
    const installationStore = useInstallationStore()
    // Enable backup service if the app is installed as PWA OR in test mode
    return installationStore.isStandalone || installationStore.isTestMode
  },

  /**
   * Get the device ID for backup
   * Generates and stores a unique device ID if one doesn't exist
   */
  getDeviceId(): string {
    const installationStore = useInstallationStore()

    // For development/testing, use a fixed device ID
    if (installationStore.isTestMode) {
      return 'dev-device-1'
    }

    // Check if we already have a device ID stored
    let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)

    // If not, generate a new one and store it
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
    }

    return deviceId
  },

  /**
   * Schedule a backup with exponential backoff retry
   */
  async scheduleBackup(retryCount = 0): Promise<boolean> {
    console.log('Backup scheduled')

    try {
      const success = await this.performBackup()
      if (success) {
        console.log('Backup completed successfully')
        return true
      }

      // If we've exhausted all retries, give up
      if (retryCount >= BACKUP_RETRY_DELAYS.length) {
        console.error('Backup failed after all retry attempts')
        return false
      }

      // Schedule a retry with exponential backoff
      const delay = BACKUP_RETRY_DELAYS[retryCount]
      console.log(`Scheduling backup retry in ${delay}ms`)

      setTimeout(() => {
        this.scheduleBackup(retryCount + 1)
      }, delay)

      return false
    } catch (error) {
      console.error('Error during backup:', error)

      // Retry with exponential backoff
      if (retryCount < BACKUP_RETRY_DELAYS.length) {
        const delay = BACKUP_RETRY_DELAYS[retryCount]
        console.log(`Scheduling backup retry in ${delay}ms`)

        setTimeout(() => {
          this.scheduleBackup(retryCount + 1)
        }, delay)
      }

      return false
    }
  },

  /**
   * Perform the actual backup operation
   */
  async performBackup(): Promise<boolean> {
    try {
      const userStore = useUserStore()
      const historyStore = useHistoryStore()
      const notesStore = useNotesStore()
      const deviceId = this.getDeviceId()

      // Get user name (or use 'anonymous' if not set)
      const userName = userStore.user.name || 'anonymous'

      // Collect data to back up
      const data = {
        history: historyStore.history,
        notes: notesStore.notes,
        user: userStore.user,
        timestamp: new Date().toISOString(),
        deviceId
      }

      console.log('Sending backup to server...')

      // Send data to the server
      const response = await fetch(`${BACKUP_ENDPOINT}/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data,
          userName
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Backup API error:', errorData)
        return false
      }

      const result = await response.json()
      console.log('Backup API response:', result)

      // Update last backup date in user store
      userStore.updateLastBackupDate()

      return true
    } catch (error) {
      console.error('Error performing backup:', error)
      return false
    }
  },

  /**
   * Test the connection to the API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/health')
      return response.ok
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  },

  /**
   * Get the list of available backups for the current device
   * Also includes backups associated with the current user's name if available
   */
  async getBackups(): Promise<BackupMetadata[]> {
    try {
      const deviceId = this.getDeviceId()
      const response = await fetch(`/api/backups/${deviceId}`)

      if (!response.ok) {
        console.error('Failed to fetch backups:', await response.text())
        return []
      }

      const data = await response.json()
      return data.backups || []
    } catch (error) {
      console.error('Error fetching backups:', error)
      return []
    }
  },

  /**
   * Find backups by device ID
   */
  async findBackupsByDeviceId(deviceId: string): Promise<BackupMetadata[]> {
    try {
      const response = await fetch(`/api/backups/${deviceId}`)

      if (!response.ok) {
        console.error('Failed to fetch backups by device ID:', await response.text())
        return []
      }

      const data = await response.json()
      return data.backups || []
    } catch (error) {
      console.error('Error fetching backups by device ID:', error)
      return []
    }
  },

  /**
   * Find backups by user name (for cross-device recovery)
   * This is now used internally by the loadBackups function
   */
  async findBackupsByName(name: string): Promise<BackupMetadata[]> {
    if (!name || name.trim() === '') {
      return []
    }

    try {
      const response = await fetch(`/api/find-backups?name=${encodeURIComponent(name)}`)

      if (!response.ok) {
        console.error('Failed to fetch backups by name:', await response.text())
        return []
      }

      const data = await response.json()
      return data.backups || []
    } catch (error) {
      console.error('Error fetching backups by name:', error)
      return []
    }
  },

  /**
   * Restore from a backup
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      console.log('Restoring backup with ID:', backupId)

      const response = await fetch(`/api/backup/${encodeURIComponent(backupId)}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch backup data:', errorText)
        throw new Error(`Server returned ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        console.error('Invalid backup data received:', result)
        throw new Error('Invalid backup data received')
      }

      const backupData = result.data

      // Restore data to stores
      const historyStore = useHistoryStore()
      const notesStore = useNotesStore()
      const userStore = useUserStore()

      // Import history data
      if (backupData.history) {
        historyStore.importHistory(
          backupData.history,
          {
            ageGroup: backupData.user.ageGroup,
            bowType: backupData.user.bowType,
            gender: backupData.user.gender
          }
        )
      }

      // Import notes data
      if (backupData.notes) {
        notesStore.importNotes(backupData)
      }

      // Import user data
      if (backupData.user) {
        const userData = backupData.user

        // Handle potential missing fields in older backup files
        let indoorClassifications = userData.indoorClassifications || {}
        let outdoorClassifications = userData.outdoorClassifications || {}

        // Use default values for missing fields
        const name = userData.name || ''
        const constructiveCriticism = userData.constructiveCriticism !== undefined ? userData.constructiveCriticism : true
        const experimentalTargetFace = userData.experimentalTargetFace || false
        const knockColor = userData.knockColor || '#FF69B4'

        userStore.save(
          userData.ageGroup,
          userData.gender,
          userData.bowType,
          indoorClassifications,
          outdoorClassifications,
          userData.indoorSeasonStartDate,
          userData.outdoorSeasonStartDate,
          name,
          constructiveCriticism,
          experimentalTargetFace,
          knockColor
        )
      }

      // Update last backup date
      userStore.updateLastBackupDate()

      return true
    } catch (error) {
      console.error('Error restoring backup:', error)
      throw error // Re-throw to allow component to handle it
    }
  }
}

export default backupService
