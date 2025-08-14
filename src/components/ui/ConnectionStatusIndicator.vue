<template>
  <div v-if="shouldShowStatus" class="connection-status" :class="statusClass">
    <div class="status-icon"></div>
    <span class="status-text">{{ statusMessage }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  connectionStatus: {
    type: String,
    required: true,
    validator: (value) => ['disconnected', 'connecting', 'connected', 'error'].includes(value)
  },
  isInShoot: {
    type: Boolean,
    default: false
  },
  lastUpdateTime: {
    type: [Date, Object],
    default: null
  }
})

// Only show status when user is in a live shoot and there are connection issues
const shouldShowStatus = computed(() => {
  return props.isInShoot && props.connectionStatus !== 'connected'
})

const statusClass = computed(() => {
  return `status-${props.connectionStatus}`
})

const statusMessage = computed(() => {
  const timeSinceUpdate = getTimeSinceUpdate()
  
  switch (props.connectionStatus) {
    case 'connecting':
      return timeSinceUpdate 
        ? `Reconnecting... ${timeSinceUpdate}` 
        : 'Connecting to live updates...'
    case 'error':
      return timeSinceUpdate
        ? `Failed to send last update ${timeSinceUpdate}`
        : 'Failed to connect - updates may be delayed'
    case 'disconnected':
      return timeSinceUpdate
        ? `Disconnected ${timeSinceUpdate}`
        : 'Disconnected - reconnecting...'
    default:
      return ''
  }
})

function getTimeSinceUpdate() {
  if (!props.lastUpdateTime) return null
  
  const now = new Date()
  const timeDiff = Math.floor((now.getTime() - props.lastUpdateTime.getTime()) / 1000)
  
  if (timeDiff < 60) {
    return `${timeDiff} seconds ago`
  } else if (timeDiff < 3600) {
    const minutes = Math.floor(timeDiff / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else {
    const hours = Math.floor(timeDiff / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
}
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.status-icon {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-connecting {
  background-color: var(--color-background-soft);
  color: var(--color-text-mute);
  border: 1px solid var(--color-border);
}

.status-connecting .status-icon {
  background-color: #f59e0b;
  animation: pulse 2s infinite;
}

.status-error {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid #f87171;
}

.status-error .status-icon {
  background-color: #ef4444;
}

.status-disconnected {
  background-color: var(--color-background-soft);
  color: var(--color-text-mute);
  border: 1px solid var(--color-border);
}

.status-disconnected .status-icon {
  background-color: #6b7280;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>