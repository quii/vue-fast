<script setup>
import { ref } from 'vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

// State
const connectionStats = ref(null)
const isLoadingStats = ref(false)
const lastStatsUpdate = ref(null)

// Functions
async function fetchConnectionStats() {
  isLoadingStats.value = true
  try {
    const response = await fetch('/api/health')
    const data = await response.json()
    connectionStats.value = data.websocket || null
    lastStatsUpdate.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Failed to fetch connection stats:', error)
    connectionStats.value = { error: 'Failed to load stats' }
  } finally {
    isLoadingStats.value = false
  }
}

function formatShootStats(shoots) {
  if (!shoots || Object.keys(shoots).length === 0) {
    return 'No active shoots'
  }
  return Object.entries(shoots)
    .map(([shootCode, count]) => `#${shootCode}: ${count} users`)
    .join(', ')
}
</script>

<template>
  <SectionCard title="Live Connection Stats">
    <div class="stats-section">
      <p class="stats-description">Check WebSocket connection health for live shoots</p>
      
      <div class="stats-actions">
        <BaseButton 
          @click="fetchConnectionStats" 
          :disabled="isLoadingStats"
          variant="outline"
        >
          {{ isLoadingStats ? 'Loading...' : 'Refresh Stats' }}
        </BaseButton>
      </div>

      <div v-if="connectionStats" class="stats-data">
        <div v-if="connectionStats.error" class="stats-error">
          ❌ {{ connectionStats.error }}
        </div>
        <div v-else class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Active Connections:</span>
            <span class="stat-value">{{ connectionStats.total || 0 }}/{{ connectionStats.max || 0 }}</span>
          </div>
          <div v-if="connectionStats.debug" class="stat-item">
            <span class="stat-label">Actual WS Clients:</span>
            <span class="stat-value">{{ connectionStats.debug.actualWsClients }}</span>
          </div>
          <div v-if="connectionStats.debug" class="stat-item">
            <span class="stat-label">Connection States:</span>
            <span class="stat-value">Open: {{ connectionStats.debug.readyStates[1] || 0 }}, Closing: {{ connectionStats.debug.readyStates[2] || 0 }}, Closed: {{ connectionStats.debug.readyStates[3] || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active Shoots:</span>
            <span class="stat-value">{{ formatShootStats(connectionStats.shoots) }}</span>
          </div>
          <div v-if="lastStatsUpdate" class="stat-item">
            <span class="stat-label">Last Updated:</span>
            <span class="stat-value">{{ lastStatsUpdate }}</span>
          </div>
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
.stats-section {
  text-align: center;
}

.stats-description {
  margin-bottom: 1rem;
  color: var(--color-text-mute);
  font-size: 0.9rem;
}

.stats-actions {
  margin-bottom: 1rem;
}

.stats-data {
  margin-top: 1rem;
}

.stats-error {
  color: var(--color-error, #dc3545);
  padding: 0.5rem;
  background-color: var(--color-error-bg, #f8d7da);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--color-background-soft);
  border-radius: 4px;
}

.stat-label {
  font-weight: 600;
  color: var(--color-text);
}

.stat-value {
  color: var(--color-text-mute);
  font-family: monospace;
  font-size: 0.9rem;
}
</style>
