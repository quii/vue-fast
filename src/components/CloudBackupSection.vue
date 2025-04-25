<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/ui/BaseButton.vue'
import { backupService } from '@/services/backupService'

const toast = useToast()
const cloudBackupStatus = ref('Ready') // Initial status
const backups = ref([]) // Will hold list of available backups

// Computed property to check if a backup is in progress
const isBackingUp = computed(() =>
  cloudBackupStatus.value === 'Backing up...' ||
  cloudBackupStatus.value === 'Testing connection...'
)

// Load backups when component is mounted
async function loadBackups() {
  try {
    backups.value = await backupService.getBackups()
  } catch (error) {
    console.error('Error loading backups:', error)
  }
}

async function testApiConnection() {
  cloudBackupStatus.value = 'Testing connection...'

  try {
    const isConnected = await backupService.testConnection()

    if (isConnected) {
      cloudBackupStatus.value = 'Connected'
      toast.success('API connection successful!')
    } else {
      cloudBackupStatus.value = 'Connection failed'
      toast.error('API connection failed')
    }
  } catch (error) {
    console.error('Error testing API connection:', error)
    cloudBackupStatus.value = 'Error'
    toast.error('Error testing API connection')
  }
}

async function manualBackup() {
  cloudBackupStatus.value = 'Backing up...'

  try {
    const success = await backupService.scheduleBackup()

    if (success) {
      cloudBackupStatus.value = 'Backup successful'
      toast.success('Cloud backup successful!')
      // Refresh the list of backups
      await loadBackups()
    } else {
      cloudBackupStatus.value = 'Backup failed'
      toast.error('Cloud backup failed')
    }
  } catch (error) {
    console.error('Error during manual backup:', error)
    cloudBackupStatus.value = 'Error'
    toast.error('Error during cloud backup')
  }
}

async function restoreBackup(backupId) {
  if (!confirm('Are you sure you want to restore this backup? Your current data will be replaced.')) {
    return
  }

  cloudBackupStatus.value = 'Restoring...'

  try {
    const success = await backupService.restoreBackup(backupId)

    if (success) {
      cloudBackupStatus.value = 'Restore successful'
      toast.success('Backup restored successfully!')
    } else {
      cloudBackupStatus.value = 'Restore failed'
      toast.error('Failed to restore backup')
    }
  } catch (error) {
    console.error('Error restoring backup:', error)
    cloudBackupStatus.value = 'Error'
    toast.error('Error restoring backup')
  }
}
</script>

<template>
  <div class="cloud-backup">
    <p class="explanation">
      Your data can be automatically backed up to the cloud when you save scores.
      <span class="status-indicator">Status: <strong>{{ cloudBackupStatus }}</strong></span>
    </p>
    <p class="beta-note">
      Cloud backup is currently in beta. Your data is still stored locally on this device.
    </p>

    <div class="button-group">
      <BaseButton
        variant="primary"
        @click="manualBackup"
        :disabled="isBackingUp"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </template>
        Backup Now
      </BaseButton>

      <BaseButton
        variant="outline"
        @click="testApiConnection"
        :disabled="isBackingUp"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </template>
        Test Connection
      </BaseButton>
    </div>

    <!-- Backup list - will be populated in future phases -->
    <div v-if="backups.length > 0" class="backup-list">
      <h4>Available Backups</h4>
      <ul>
        <li v-for="backup in backups" :key="backup.id" class="backup-item">
          <div class="backup-info">
            <span class="backup-date">{{ new Date(backup.timestamp).toLocaleString() }}</span>
          </div>
          <BaseButton
            variant="outline"
            size="small"
            @click="restoreBackup(backup.id)"
            :disabled="isBackingUp"
          >
            Restore
          </BaseButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.cloud-backup {
  width: 100%;
}

.explanation {
  margin-bottom: 1rem;
  line-height: 1.4;
  color: var(--color-text);
}

.status-indicator {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.button-group :deep(.base-button) {
  flex: 1;
}

.button-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
}

.beta-note {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-style: italic;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
}

.backup-list {
  margin: 1rem 0;
  border-top: 1px solid var(--color-border-light);
  padding-top: 1rem;
}

.backup-list h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: var(--color-background-soft);
}

.backup-date {
  font-size: 0.9rem;
}
</style>
