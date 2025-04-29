<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import SectionCard from '@/components/ui/SectionCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import BackupCard from '@/components/backup/BackupCard.vue'
import RefreshIcon from '@/components/icons/RefreshIcon.vue'

const toast = useToast()
const backups = ref([])
const isLoading = ref(false)
const totalBackups = ref(0)

onMounted(async () => {
  await loadBackups()
})

const totalStorageSize = computed(() => {
  const totalBytes = backups.value.reduce((total, backup) => {
    return total + (backup.size || 0)
  }, 0)

  return formatBytes(totalBytes)
})

const uniqueUsers = computed(() => {
  // Get all unique user names, filtering out anonymous and test users
  const uniqueNames = new Set()

  backups.value.forEach(backup => {
    const userName = backup.userName || ''

    // Skip anonymous users and test archers
    if (userName.toLowerCase() !== 'anonymous' &&
      !userName.toLowerCase().includes('test archer') &&
      userName.trim() !== '') {
      uniqueNames.add(userName)
    }
  })

  return uniqueNames.size
})

async function loadBackups() {
  try {
    isLoading.value = true
    const response = await fetch('/api/list-all-backups')

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    backups.value = data.backups || []
    totalBackups.value = data.count || 0

    toast.success(`Loaded ${totalBackups.value} backups`)
  } catch (error) {
    console.error('Error loading backups:', error)
    toast.error(`Failed to load backups: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString || dateString === 'unknown') return 'Unknown date'
  try {
    return new Date(dateString).toLocaleString()
  } catch (e) {
    return dateString
  }
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown size'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function downloadBackupData(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'backup-data.json'
  document.body.appendChild(a)
  a.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

async function viewBackup(key) {
  try {
    const response = await fetch(`/api/backup/${encodeURIComponent(key)}`)

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    downloadBackupData(data, `backup-${key}.json`)

  } catch (error) {
    console.error('Error viewing backup:', error)
    toast.error(`Failed to view backup: ${error.message}`)
  }
}

function handleTopBarAction({ action }) {
  if (action === 'refresh') {
    loadBackups()
  }
}
</script>

<template>
  <div class="backup-debugger">
    <BaseTopBar
      :infoDisplays="[
        { value: totalBackups, label: 'Backups' },
        { value: uniqueUsers, label: 'Users' },
        { value: totalStorageSize, label: 'Storage', class: 'wide' }
      ]"
      :actionButtons="[
        {
          iconComponent: RefreshIcon,
          label: 'Refresh',
          action: 'refresh',
          disabled: isLoading
        }
      ]"
      @action="handleTopBarAction"
    />

    <div v-if="isLoading" class="loading">
      Loading backups...
    </div>

    <div v-else-if="backups.length === 0" class="no-backups">
      No backups found.
    </div>

    <div v-else class="backup-list">
      <!-- Card-based view using BackupCard -->
      <div class="backup-cards">
        <BackupCard
          v-for="backup in backups"
          :key="backup.key"
          :backup="backup"
          actionLabel="View"
          @action="viewBackup"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.backup-debugger {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.warning {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 1rem;
}

.loading, .no-backups {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-light);
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin-top: 1rem;
}

.backup-list {
  margin-top: 0.5rem;
}

.backup-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>