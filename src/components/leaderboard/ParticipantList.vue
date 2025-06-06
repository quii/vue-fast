<script setup>
import { computed } from 'vue'
import BaseCard from '../BaseCard.vue'
import { useUserStore } from '@/stores/user'
import { formatRoundName } from '../../domain/scoring/round/formatting.js'

const props = defineProps({
  participants: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    required: false
  }
})

const userStore = useUserStore()

// Computed
const sortedParticipants = computed(() => {
  if (!props.participants) return []

  return [...props.participants]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((participant, index) => ({
      ...participant,
      position: index + 1
    }))
})

// Helper function to get card classes for a participant
function getCardClasses(participant) {
  const classes = []

  if (participant.archerName === userStore.user.name) {
    classes.push('is-current-user')
  }

  if (participant.finished) {
    classes.push('is-finished')
  }

  if (participant.currentClassification) {
    classes.push(participant.currentClassification)
  }

  return classes.join(' ')
}

// Helper function to get position indicator data
function getPositionIndicator(participant) {
  return {
    text: participant.position.toString(),
    class: getPositionIndicatorClass(participant)
  }
}

function getPositionIndicatorClass(participant) {
  const classes = ['position-indicator']

  if (participant.finished) {
    classes.push('is-finished')
  }

  if (participant.currentClassification) {
    classes.push(participant.currentClassification)
  }

  return classes.join(' ')
}
</script>

<template>
  <div class="participant-list">
    <h4 v-if="title" class="list-title">{{ title }}</h4>

    <div v-if="sortedParticipants.length === 0" class="empty-state">
      <p>No participants in this group.</p>
    </div>

    <div v-else class="leaderboard-list">
      <BaseCard
        v-for="participant in sortedParticipants"
        :key="participant.id"
        :indicator="getPositionIndicator(participant)"
        :class="getCardClasses(participant)"
        class="participant-card"
      >
        <div class="card-main">
          <div class="card-info">
            <h3 class="archer-name">
              {{ participant.archerName }}
              <span v-if="participant.archerName === userStore.user.name" class="you-indicator">(You)</span>
              <span v-if="participant.finished" class="finished-indicator">✓ Finished</span>
            </h3>
            <div class="card-details">
              <span class="round-name">{{ formatRoundName(participant.roundName) }}</span>
              <span v-if="participant.currentClassification && !participant.finished" class="classification-badge">On track for: {{ participant.currentClassification }}</span>
              <span v-if="participant.currentClassification && participant.finished" class="classification-badge">Achieved: {{ participant.currentClassification }}</span>
              <span class="arrows-shot">{{ participant.arrowsShot }} arrow{{ participant.arrowsShot !== 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="score-container">
            <div class="card-score">
              {{ participant.totalScore }}
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.participant-list {
  display: flex;
  flex-direction: column;
}

.list-title {
  margin: 0 0 1rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border, #eee);
  color: var(--color-text);
  font-size: 1.1em;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-mute, #666);
  font-style: italic;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Participant card styling */
.participant-card {
  margin-bottom: 0; /* Override BaseCard's default margin */
}

.participant-card.is-current-user {
  border: 2px solid var(--color-border);
}

.participant-card.is-finished {
  background-color: var(--color-background-mute, #f8f9fa);
}

.participant-card.is-finished.is-current-user {
  border: 2px solid var(--color-success, #28a745);
}

/* Classification colors */
.participant-card.B1 {
  background-color: hsl(3, 84%, 36%);
  color: white;
}

.participant-card.B2 {
  background-color: hsl(3, 84%, 46%);
  color: white;
}

.participant-card.B3 {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

.participant-card.A3 {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
}

.participant-card.A2 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

.participant-card.A1 {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
}

.participant-card.MB,
.participant-card.GMB,
.participant-card.EMB {
  background-color: rebeccapurple;
  color: white;
}

/* Position indicator styling */
:deep(.position-indicator) {
  background-color: var(--color-text-light, #666);
  color: white;
  font-weight: bold;
  font-size: 1.2em;
}

:deep(.position-indicator.is-finished) {
  background-color: var(--color-success, #28a745);
}

/* Override position indicator colors for classifications */
:deep(.position-indicator.B1),
:deep(.position-indicator.B2),
:deep(.position-indicator.B3),
:deep(.position-indicator.MB),
:deep(.position-indicator.GMB),
:deep(.position-indicator.EMB) {
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
}

:deep(.position-indicator.A3),
:deep(.position-indicator.A2),
:deep(.position-indicator.A1) {
  background-color: rgba(6, 19, 69, 0.2);
  color: #061345;
}

/* Card content styling */
.card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.archer-name {
  margin: 0;
  font-size: 1.3em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}

.you-indicator {
  font-weight: 400;
  color: var(--color-text-light, #666);
  font-size: 0.8em;
}

.finished-indicator {
  font-weight: 500;
  color: var(--color-success, #28a745);
  font-size: 0.75em;
  background-color: var(--color-success-light, #d4edda);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  white-space: nowrap;
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 0.2em;
  gap: 1em;
}

.round-name {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
}

.classification-badge {
  font-size: 0.75em;
  font-weight: 600;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.arrows-shot {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-weight: 500;
  margin-left: auto;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-score {
  font-size: 1.3em;
  font-weight: 700;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  color: var(--color-text-light);
}

.participant-card.is-finished .card-score {
  color: var(--color-success, #28a745);
}

/* Override text colors for classification cards to ensure readability */
.participant-card.B1 .you-indicator,
.participant-card.B2 .you-indicator,
.participant-card.B3 .you-indicator,
.participant-card.MB .you-indicator,
.participant-card.GMB .you-indicator,
.participant-card.EMB .you-indicator {
  color: rgba(255, 255, 255, 0.7);
}

.participant-card.B1 .round-name,
.participant-card.B2 .round-name,
.participant-card.B3 .round-name,
.participant-card.MB .round-name,
.participant-card.GMB .round-name,
.participant-card.EMB .round-name,
.participant-card.B1 .arrows-shot,
.participant-card.B2 .arrows-shot,
.participant-card.B3 .arrows-shot,
.participant-card.MB .arrows-shot,
.participant-card.GMB .arrows-shot,
.participant-card.EMB .arrows-shot {
  color: rgba(255, 255, 255, 0.8);
}
</style>