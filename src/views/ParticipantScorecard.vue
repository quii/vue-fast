<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import BaseCard from '@/components/BaseCard.vue'
import ArcherDetails from '@/components/ArcherDetails.vue'
import RoundScores from '@/components/RoundScores.vue'
import BackIcon from '@/components/icons/BackIcon.vue'
import { useShootStore } from '@/stores/shoot'
import { roundConfigManager } from '@/domain/scoring/game_types'
import { formatRoundName } from '@/domain/scoring/round/formatting'

const route = useRoute()
const router = useRouter()
const shootStore = useShootStore()

// Loading state
const isRestoring = ref(false)

// Get route params
const shootCode = computed(() => route.params.shootCode)
const participantId = computed(() => route.params.participantId)

// Get the current shoot and find the participant
const currentShoot = computed(() => shootStore.currentShoot)
const participant = computed(() => {
  if (!currentShoot.value?.participants) {
    console.log('No participants in current shoot:', currentShoot.value)
    return null
  }
  const found = currentShoot.value.participants.find(p => p.id === participantId.value)
  console.log('Looking for participant ID:', participantId.value, 'Found:', found)
  return found
})

// Round information
const round = computed(() => {
  if (!participant.value?.roundName) return null
  return roundConfigManager.getRound(participant.value.roundName)
})

const endSize = computed(() => round.value?.endSize || 6)

// Status and display info
const status = computed(() => {
  if (!participant.value) return ''
  return participant.value.finished ? 'Finished' : 'In Progress'
})

// Convert string classification to object format expected by ArcherDetails
const classificationObject = computed(() => {
  if (!participant.value?.currentClassification) return null
  return {
    name: participant.value.currentClassification,
    scheme: 'Unknown' // We don't have scheme info in participant data
  }
})

// Top bar configuration
const infoDisplays = computed(() => [
  {
    value: `#${shootCode.value}`,
    label: 'Shoot Code',
    class: 'wide'
  }
])

const actionButtons = computed(() => [
  {
    iconComponent: BackIcon,
    label: 'Back to Leaderboard',
    action: 'back',
    variant: 'outline'
  }
])

function handleAction(actionData) {
  if (actionData.action === 'back') {
    router.push('/leaderboard')
  }
}

// Ensure we have the current shoot data
onMounted(async () => {
  console.log('ParticipantScorecard mounted. Route params:', route.params)
  console.log('Current shoot available:', !!currentShoot.value)
  
  // If we don't have the shoot data, try to connect using the shoot code from URL
  if (!currentShoot.value) {
    isRestoring.value = true
    console.log('No current shoot data, attempting to restore from persisted state...')
    
    // First try to restore from localStorage - this will initialize WebSocket if needed
    const restored = await shootStore.tryRestoreFromPersistedState()
    
    // If restoration failed but we have a shoot code, try connecting as viewer
    if (!restored && shootCode.value) {
      console.log('Restoration failed, attempting to connect as viewer to shoot:', shootCode.value)
      try {
        await shootStore.connectAsViewer(shootCode.value)
        console.log('Successfully connected as viewer')
      } catch (error) {
        console.error('Failed to connect as viewer:', error)
        router.push('/leaderboard')
        return
      }
    } else if (!restored) {
      console.warn('Failed to restore shoot data and no shoot code available, redirecting to leaderboard')
      router.push('/leaderboard')
      return
    }
    
    isRestoring.value = false
  }
})

onUnmounted(() => {
  // Clean up WebSocket connection when leaving the component
  shootStore.cleanup()
})
</script>

<template>
  <div class="page">
    <BaseTopBar
      :info-displays="infoDisplays"
      :action-buttons="actionButtons"
      alignment="right"
      @action="handleAction"
    />

    <!-- Loading state -->
    <div v-if="isRestoring" class="loading-container">
      <p>Restoring shoot data...</p>
    </div>

    <!-- No participant found -->
    <div v-else-if="!participant" class="loading-container">
      <p>Participant not found...</p>
    </div>

    <!-- Participant data -->
    <div v-else-if="participant" class="scorecard-content">
      <!-- Participant details -->
      <BaseCard>
        <div class="participant-info">
          <h2 class="participant-name">{{ participant.archerName }}'s Scorecard</h2>
          <div class="participant-details">
            <div class="detail-item">
              <strong>Round:</strong> {{ formatRoundName(participant.roundName) }}
            </div>
            <div class="detail-item">
              <strong>Status:</strong> {{ status }}
            </div>
            <div class="detail-item">
              <strong>Total Score:</strong> {{ participant.totalScore }}
            </div>
            <div class="detail-item">
              <strong>Arrows Shot:</strong> {{ participant.arrowsShot }}
            </div>
            <div v-if="participant.currentClassification" class="detail-item">
              <strong>Classification:</strong> {{ participant.currentClassification }}
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Scorecard display -->
      <div v-if="participant.scores && participant.scores.length > 0" class="scorecard">
        <RoundScores
          :scores="participant.scores"
          :end-size="endSize"
          :user-profile="null"
          :game-type="participant.roundName"
        />
      </div>

      <!-- No scores message -->
      <div v-else class="no-scores">
        <BaseCard>
          <div class="no-scores-content">
            <h3>No Individual Scores Available</h3>
            <p>This archer hasn't recorded individual arrow scores yet.</p>
            <div class="score-summary">
              <strong>Current Total: {{ participant.totalScore }}</strong>
              <br>
              <span>({{ participant.arrowsShot }} arrow{{ participant.arrowsShot !== 1 ? 's' : '' }} shot)</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 0.5rem;
}

.scorecard-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-container {
  text-align: center;
  padding: 2rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-scores {
  flex: 1;
}

.no-scores-content {
  text-align: center;
  padding: 2rem;
}

.no-scores-content h3 {
  color: var(--color-text);
  margin-bottom: 1rem;
}

.no-scores-content p {
  color: var(--color-text-mute, #666);
  margin-bottom: 1.5rem;
}

.score-summary {
  font-size: 1.1rem;
  color: var(--color-text);
}

.score-summary strong {
  font-size: 1.3rem;
  color: var(--color-highlight, #4CAF50);
}

.participant-info {
  text-align: center;
}

.participant-name {
  margin: 0 0 1rem 0;
  color: var(--color-highlight, #4CAF50);
  font-size: 1.2rem;
}

.participant-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.detail-item {
  background-color: var(--color-background-mute);
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.detail-item strong {
  font-weight: 600;
}
</style>
