<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'
import CloudIcon from '@/components/icons/CloudIcon.vue'
import BackupCard from '@/components/backup/BackupCard.vue'
import { backupService } from '@/services/backupService'
import { formatDateContextually } from '@/domain/scoring/round/formatting.js'
import { useUserStore } from '@/stores/user' // Import the user store

const toast = useToast()
const userStore = useUserStore() // Get access to the user store
const cloudBackupStatus = ref('Ready') // Initial status
const backups = ref([]) // Will hold list of available backups
const isLoading = ref(false) // Loading state

// Computed property to check if a backup is in progress
const isBackingUp = computed(() =>
  cloudBackupStatus.value === 'Backing up...' ||
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

    // First get backups by device ID
    const deviceBackups = await backupService.getBackups()

    // Then get backups by user name if available
    let userNameBackups = []
    const userName = userStore.user.name
    if (userName && userName.trim() !== '') {
      userNameBackups = await backupService.findBackupsByName(userName)
    }

    // Combine and deduplicate backups (using backup key as unique identifier)
    const allBackups = [...deviceBackups]

    // Add user name backups that aren't already in the list
    userNameBackups.forEach(backup => {
      if (!allBackups.some(existing => existing.key === backup.key)) {
        allBackups.push(backup)
      }
    })

    // Sort by timestamp (newest first)
    allBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    backups.value = allBackups
    cloudBackupStatus.value = backups.value.length > 0 ? 'Ready' : 'No backups found'
  } catch (error) {
    console.error('Error loading backups:', error)
    cloudBackupStatus.value = 'Error loading backups'
    toast.error('Failed to load backups')
  } finally {
    isLoading.value = false
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
</script>

<template>
  <div class="cloud-backup">
    <div class="section-header">
      <CloudIcon class="cloud-icon" />
      <span class="status-text">Cloud Backup <span class="status-badge">{{ cloudBackupStatus }}</span></span>
    </div>

    <p class="explanation">
      Your data can be automatically backed up to the cloud when you save scores.
      Access your backups from any device.
    </p>

    <ButtonGroup>
      <BaseButton
        variant="primary"
        @click="manualBackup"
        :disabled="isBackingUp"
      >
        Backup Now
      </BaseButton>
    </ButtonGroup>

    <!-- Backup list -->
    <div v-if="backups.length > 0" class="backup-list">
      <h4>Available Backups</h4>
      <div class="backup-cards">
        <BackupCard
          v-for="backup in backups"
          :key="backup.key"
          :backup="backup"
          actionLabel="Restore"
          @action="restoreBackup"
        />
      </div>
    </div>
    <div v-else-if="!isLoading" class="no-backups">
      <p>No backups found. Create your first backup by clicking "Backup Now".</p>
    </div>
    <div v-if="isLoading" class="loading">
      <p>Loading...</p>
    </div>
  </div>
</template>

<style scoped>
.cloud-backup {
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.cloud-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

.status-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.status-badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: normal;
  padding: 0.2em 0.6em;
  border-radius: 12px;
  background-color: var(--color-background-soft);
  color: var(--color-text-light);
  margin-left: 0.5rem;
  vertical-align: middle;
}

.explanation {
  margin-bottom: 1rem;
  line-height: 1.4;
  color: var(--color-text);
}

.button-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
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

.no-backups, .loading {
  margin: 1rem 0;
  padding: 1rem;
  text-align: center;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  color: var(--color-text-light);
}
</style>
