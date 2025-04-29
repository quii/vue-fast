<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatDateContextually } from '@/domain/scoring/round/formatting.js'

const props = defineProps({
  backup: {
    type: Object,
    required: true
  },
  actionLabel: {
    type: String,
    default: 'Restore'
  },
  disableActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  return new Date(dateString).toLocaleString()
}

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

const colorScheme = computed(() => getColorScheme(props.backup.timestamp))
const contextualTime = computed(() => getContextualTime(props.backup.timestamp))
</script>

<template>
  <div class="backup-card">
    <div :class="['time-indicator', colorScheme]">
      <span class="time-text">{{ contextualTime }}</span>
    </div>
    <div class="card-content">
      <div class="card-main">
        <div class="card-info">
          <h3 class="backup-title">{{ backup.userName || 'Unknown user' }}</h3>
          <div class="card-details">
            <span class="backup-date">{{ formatDate(backup.timestamp) }}</span>
            <span class="device-id">{{ backup.deviceId }}</span>
            <span v-if="backup.size" class="backup-size">{{ (backup.size / 1024).toFixed(1) }} KB</span>
          </div>
        </div>
        <div class="action-container" v-if="!disableActions">
          <BaseButton
            variant="outline"
            size="small"
            @click="emit('action', backup.key)"
          >
            {{ actionLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backup-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
  margin-bottom: 0.5rem;
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

.backup-date, .device-id, .backup-size {
  font-size: 0.85em;
  color: var(--color-text-light);
}

.action-container {
  display: flex;
  align-items: center;
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
