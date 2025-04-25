import { useInstallationStore } from '@/stores/installation'
import { useUserStore } from '@/stores/user'
import { useHistoryStore } from '@/stores/history'
import { useNotesStore } from '@/stores/user_notes'

// Constants
const BACKUP_RETRY_DELAYS = [2000, 5000, 10000, 30000] // Retry delays in ms (exponential backoff)
const BACKUP_ENDPOINT = '/api/backup'

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
   * Currently using a placeholder - in a real implementation, this would be a unique
   * identifier stored in the installation store
   */
  getDeviceId(): string {
    const installationStore = useInstallationStore()

    // For development/testing, use a fixed device ID
    if (installationStore.isTestMode) {
      return 'dev-device-1'
    }

    // TODO: Generate and store a real device ID
    return 'device-1'
  },

  /**
   * Schedule a backup with exponential backoff retry
   */
  async scheduleBackup(retryCount = 0): Promise<boolean> {
    console.log('Backup scheduled')

    if (!this.isEnabled()) {
      console.log('Backup not enabled - app is not installed as PWA')
      return false
    }

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

      // Collect data to back up
      const data = {
        history: historyStore.history,
        notes: notesStore.notes,
        user: userStore.user,
        timestamp: new Date().toISOString(),
        deviceId: this.getDeviceId()
      }

      // For now, just log the data that would be backed up
      console.log('Data to back up:', data)

      // In a real implementation, we would send this data to the server
      // This is a placeholder for the actual API call
      // const response = await fetch(`${BACKUP_ENDPOINT}/${this.getDeviceId()}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });

      // return response.ok;

      // For now, simulate a successful backup
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
   * Get the list of available backups
   * This is a placeholder for the actual implementation
   */
  async getBackups(): Promise<any[]> {
    // In a real implementation, we would fetch the list of backups from the server
    return []
  },

  /**
   * Restore from a backup
   * This is a placeholder for the actual implementation
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    // In a real implementation, we would fetch the backup data from the server
    // and restore it to the stores
    return false
  }
}

export default backupService