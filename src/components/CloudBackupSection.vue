<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/ui/BaseButton.vue'
import { backupService } from '@/services/backupService'
import { formatDateContextually } from '@/domain/scoring/round/formatting.js'

const toast = useToast()
const cloudBackupStatus = ref('Ready') // Initial status
const backups = ref([]) // Will hold list of available backups
const isLoading = ref(false) // Loading state

// Computed property to check if a backup is in progress
const isBackingUp = computed(() =>
  cloudBackupStatus.value === 'Backing up...' ||
  cloudBackupStatus.value === 'Testing connection...' ||
  cloudBackupStatus.value === 'Restoring...' ||
  isLoading.value
);

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  return new Date(dateString).toLocaleString()
};

// Get contextual time for display in the indicator
const getContextualTime = (dateString) => {
  if (!dateString) return 'Unknown'
  return formatDateContextually(dateString)
}

// Get color scheme based on backup age
const getColorScheme = (dateString) => {
  if (!dateString) return 'neutral'

  const now = new Date()
  const backupDate = new Date(dateString)
  const diffHours = Math.floor((now - backupDate) / (1000 * 60 * 60))

  if (diffHours < 1) return 'recent' // Less than 1 hour
  if (diffHours < 24) return 'today' // Less than 24 hours
  if (diffHours < 168) return 'week' // Less than 1 week
  return 'older' // Older than 1 week
}

// Load backups when component is mounted
onMounted(async () => {
  await loadBackups()
});

async function loadBackups() {
  try {
    isLoading.value = true
    cloudBackupStatus.value = 'Loading backups...'
    backups.value = await backupService.getBackups()
    cloudBackupStatus.value = backups.value.length > 0 ? 'Ready' : 'No backups found'
  } catch (error) {
    console.error('Error loading backups:', error)
    cloudBackupStatus.value = 'Error loading backups'
    toast.error('Failed to load backups')
  } finally {
    isLoading.value = false
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

async function restoreBackup(backupKey) {
  if (!confirm('Are you sure you want to restore this backup? Your current data will be replaced.')) {
    return
  }

  cloudBackupStatus.value = 'Restoring...'
  console.log('Restoring backup with key:', backupKey) // Add this for debugging

  try {
    const success = await backupService.restoreBackup(backupKey)

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
    toast.error(`Error restoring backup: ${error.message}`)
  }
}

// Find backups by user name (for cross-device recovery)
async function findBackupsByName() {
  const name = prompt('Enter your name to find backups across devices:')
  if (!name) return

  cloudBackupStatus.value = 'Searching...'
  isLoading.value = true

  try {
    const foundBackups = await backupService.findBackupsByName(name)

    if (foundBackups.length > 0) {
      backups.value = foundBackups
      cloudBackupStatus.value = `Found ${foundBackups.length} backups`
      toast.success(`Found ${foundBackups.length} backups for "${name}"`)
    } else {
      cloudBackupStatus.value = 'No backups found'
      toast.info(`No backups found for "${name}"`)
    }
  } catch (error) {
    console.error('Error finding backups:', error)
    cloudBackupStatus.value = 'Error'
    toast.error('Error finding backups')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="cloud-backup">
    <p class="explanation">
      Your data can be automatically backed up to the cloud when you save scores.
      <span class="status-indicator">Status: <strong>{{ cloudBackupStatus }}</strong></span>
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

    <!-- Cross-device recovery button -->
    <div class="recovery-section">
      <BaseButton
        variant="outline"
        @click="findBackupsByName"
        :disabled="isBackingUp"
        fullWidth
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </template>
        Find Backups by Name
      </BaseButton>
    </div>

    <!-- Backup list -->
    <div v-if="backups.length > 0" class="backup-list">
      <h4>Available Backups</h4>
      <div class="backup-cards">
        <div v-for="backup in backups" :key="backup.key" class="backup-card">
          <div :class="['time-indicator', getColorScheme(backup.timestamp)]">
            <span class="time-text">{{ getContextualTime(backup.timestamp) }}</span>
          </div>
          <div class="card-content">
            <div class="card-main">
              <div class="card-info">
                <h3 class="backup-title">{{ backup.userName || 'Unknown user' }}</h3>
                <div class="card-details">
                  <span class="backup-date">{{ formatDate(backup.timestamp) }}</span>
                  <span class="device-id">{{ backup.deviceId }}</span>
                </div>
              </div>
              <div class="action-container">
                <BaseButton
                  variant="outline"
                  size="small"
                  @click="restoreBackup(backup.key)"
                  :disabled="isBackingUp"
                >
                  Restore
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!isLoading" class="no-backups">
      <p>No backups found. Create your first backup by clicking "Backup Now".</p>
    </div>
    <div v-if="isLoading" class="loading">
      <p>Loading...</p>
    </div>

    <p class="beta-note">
      Cloud backup is currently in beta. Your data is still stored locally on this device.
    </p>
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

.recovery-section {
  margin-bottom: 1rem;
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

.backup-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.backup-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.backup-card:active {
  transform: scale(0.98);
}

.time-indicator {
  width: 50px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75em 0;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
}

.time-text {
  font-weight: bold;
  font-size: 0.85em;
  line-height: 1.2;
}

.card-content {
  flex-grow: 1;
  padding: 0.75em;
  display: flex;
  flex-direction: column;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.backup-title {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
}

.card-details {
  display: flex;
  flex-direction: column;
  margin-top: 0.2em;
  gap: 0.2em;
}

.backup-date, .device-id {
  font-size: 0.85em;
  color: var(--color-text-light);
}

.action-container {
  display: flex;
  align-items: center;
}

.no-backups, .loading {
  margin: 1rem 0;
  padding: 1rem;
  text-align: center;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  color: var(--color-text-light);
}

/* Color schemes for time indicators */
.recent {
  background-color: hsla(145, 63%, 42%, 0.8);
  color: white;
}

.today {
  background-color: hsla(207, 85%, 65%, 1);
  color: white;
}

.week {
  background-color: hsla(271, 68%, 32%, 0.8);
  color: white;
}

.older {
  background-color: hsla(3, 84%, 65%, 1);
  color: white;
}

.neutral {
  background-color: var(--color-border);
  color: var(--color-text);
}
</style>
