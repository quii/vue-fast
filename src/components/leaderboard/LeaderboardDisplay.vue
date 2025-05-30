<script setup>
import { computed, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ButtonGroup from '../ui/ButtonGroup.vue'
import { useUserStore } from '@/stores/user'
import { useGameTypeStore } from '@/stores/game_type'
import { formatRoundName } from '../../domain/scoring/round/formatting.js'

const props = defineProps({
  shoot: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['leave', 'join'])

const userStore = useUserStore()
const gameTypeStore = useGameTypeStore()

// Local state for joining
const showJoinForm = ref(false)
const archerName = ref(userStore.user.name || '')
const roundName = ref(gameTypeStore.type || '')

// Computed
const sortedParticipants = computed(() => {
  if (!props.shoot?.participants) return []

  return [...props.shoot.participants]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((participant, index) => ({
      ...participant,
      position: index + 1
    }))
})

const currentUserParticipant = computed(() => {
  return sortedParticipants.value.find(p => p.archerName === userStore.user.name)
})

const isCurrentUserInShoot = computed(() => {
  return !!currentUserParticipant.value
})

const isJoinFormValid = computed(() => {
  return archerName.value.trim() && roundName.value.trim()
})

// Methods
function showJoinShoot() {
  showJoinForm.value = true
}

function cancelJoin() {
  showJoinForm.value = false
}

function handleJoin() {
  if (!isJoinFormValid.value) return

  emit('join', {
    code: props.shoot?.code,
    archerName: archerName.value.trim(),
    roundName: roundName.value.trim()
  })

  showJoinForm.value = false
}
</script>

<template>
  <div class="leaderboard-display">
    <!-- Join form (when not participating) -->
    <div v-if="showJoinForm" class="join-form">
      <h5>Join This Shoot</h5>

      <div class="form-group">
        <label for="join-archer-name">Your Name</label>
        <input
          id="join-archer-name"
          v-model="archerName"
          type="text"
          placeholder="Enter your name"
          class="form-input"
          maxlength="50"
        />
      </div>

      <div class="form-group">
        <label for="join-round-name">Round</label>
        <input
          id="join-round-name"
          v-model="roundName"
          type="text"
          placeholder="e.g., Portsmouth, WA 18"
          class="form-input"
          maxlength="50"
          @keyup.enter="handleJoin"
        />
      </div>

      <ButtonGroup>
        <BaseButton
          @click="handleJoin"
          :disabled="!isJoinFormValid"
        >
          Join Shoot
        </BaseButton>
        <BaseButton variant="outline" @click="cancelJoin">
          Cancel
        </BaseButton>
      </ButtonGroup>
    </div>

    <!-- Leaderboard -->
    <div v-else class="leaderboard-container">
      <div v-if="sortedParticipants.length === 0" class="empty-state">
        <p>No archers have joined yet.</p>
        <p class="empty-hint">Share the shoot code for others to join!</p>
      </div>

      <div v-else class="leaderboard-list">
        <div
          v-for="participant in sortedParticipants"
          :key="participant.id"
          class="leaderboard-card"
          :class="{
            'is-current-user': participant.archerName === userStore.user.name,
            [participant.currentClassification]: participant.currentClassification
          }"
        >
          <div class="position-indicator">
            <span class="position-number">{{ participant.position }}</span>
          </div>
          <div class="card-content">
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
          </div>
        </div>
      </div>

      <!-- Join button for non-participants -->
      <div v-if="!isCurrentUserInShoot" class="join-action">
        <BaseButton @click="showJoinShoot">
          Join This Shoot
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-display {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.join-form {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-background-mute, #f8f9fa);
  border-radius: 8px;
  border: 1px solid var(--color-border, #eee);
}

.join-form h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-border);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.leaderboard-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-mute, #666);
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.join-action {
  margin-top: 1rem;
  text-align: center;
  padding: 1rem 0;
}

/* Adapted from HistoryCard.vue */
.leaderboard-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease;
}

.leaderboard-card.is-current-user {
  background-color: var(--color-background-soft);
  border: 2px solid var(--color-border);
}

.leaderboard-card.is-finished {
  background-color: var(--color-background-mute, #f8f9fa);
}

.leaderboard-card.is-finished.is-current-user {
  border: 2px solid var(--color-success, #28a745);
}

/* Classification colors - copied from ClassificationFilterModal.vue */
.leaderboard-card.B1 {
  background-color: hsl(3, 84%, 36%);
  color: white;
}

.leaderboard-card.B2 {
  background-color: hsl(3, 84%, 46%);
  color: white;
}

.leaderboard-card.B3 {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

.leaderboard-card.A3 {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
}

.leaderboard-card.A2 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

.leaderboard-card.A1 {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
}

.leaderboard-card.MB,
.leaderboard-card.GMB,
.leaderboard-card.EMB {
  background-color: rebeccapurple;
  color: white;
}

/* Override position indicator colors for classifications */
.leaderboard-card.B1 .position-indicator,
.leaderboard-card.B2 .position-indicator,
.leaderboard-card.B3 .position-indicator,
.leaderboard-card.MB .position-indicator,
.leaderboard-card.GMB .position-indicator,
.leaderboard-card.EMB .position-indicator {
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
}

.leaderboard-card.A3 .position-indicator,
.leaderboard-card.A2 .position-indicator,
.leaderboard-card.A1 .position-indicator {
  background-color: rgba(6, 19, 69, 0.2);
  color: #061345;
}

.position-indicator {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-text-light, #666);
  color: white;
}

.leaderboard-card.is-finished .position-indicator {
  background-color: var(--color-success, #28a745);
}

.position-number {
  font-weight: bold;
  font-size: 1.2em;
}

.card-content {
  flex-grow: 1;
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
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

.leaderboard-card.is-finished .card-score {
  color: var(--color-success, #28a745);
}

/* Override text colors for classification cards to ensure readability */
.leaderboard-card.B1 .you-indicator,
.leaderboard-card.B2 .you-indicator,
.leaderboard-card.B3 .you-indicator,
.leaderboard-card.MB .you-indicator,
.leaderboard-card.GMB .you-indicator,
.leaderboard-card.EMB .you-indicator {
  color: rgba(255, 255, 255, 0.7);
}

.leaderboard-card.B1 .round-name,
.leaderboard-card.B2 .round-name,
.leaderboard-card.B3 .round-name,
.leaderboard-card.MB .round-name,
.leaderboard-card.GMB .round-name,
.leaderboard-card.EMB .round-name,
.leaderboard-card.B1 .arrows-shot,
.leaderboard-card.B2 .arrows-shot,
.leaderboard-card.B3 .arrows-shot,
.leaderboard-card.MB .arrows-shot,
.leaderboard-card.GMB .arrows-shot,
.leaderboard-card.EMB .arrows-shot {
  color: rgba(255, 255, 255, 0.8);
}
</style>