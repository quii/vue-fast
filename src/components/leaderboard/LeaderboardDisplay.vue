<script setup>
import { computed, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ButtonGroup from '../ui/ButtonGroup.vue'
import NotificationSettings from './NotificationSettings.vue'
import { useUserStore } from '@/stores/user'
import { useGameTypeStore } from '@/stores/game_type'
import { formatRoundName } from '../../domain/scoring/round/formatting.js'

const props = defineProps({
  shoot: {
    type: Object,
    required: true
  },
  pushNotificationManager: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['leave', 'close', 'join'])

const userStore = useUserStore()
const gameTypeStore = useGameTypeStore()

// Local state for joining
const showJoinForm = ref(false)
const archerName = ref(userStore.user.name || '')
const roundName = ref(gameTypeStore.type || '')

// New state for notification settings
const showNotificationSettings = ref(false)

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

// Add this computed property
const shootCode = computed(() => props.shoot?.code || '')

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
function handleLeave() {
  emit('leave')
}

function handleClose() {
  emit('close')
}

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

function toggleNotificationSettings() {
  showNotificationSettings.value = !showNotificationSettings.value
}
</script>

<template>
  <div class="leaderboard-display">
    <!-- Notification Settings Toggle -->
    <div v-if="pushNotificationManager" class="notification-toggle">
      <BaseButton
        variant="text"
        @click="toggleNotificationSettings"
        class="notification-toggle-btn"
      >
        📱 {{ showNotificationSettings ? 'Hide' : 'Show' }} Notifications
      </BaseButton>
    </div>

    <!-- Notification Settings (collapsible) -->
    <div v-if="showNotificationSettings && pushNotificationManager" class="notification-settings-container">
      <NotificationSettings
        :shoot-code="shootCode"
        :push-notification-manager="pushNotificationManager"
      />
    </div>

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
            'is-current-user': participant.archerName === userStore.user.name
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
                </h3>
                <div class="card-details">
                  <span class="round-name">{{ formatRoundName(participant.roundName) }}</span>
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
    </div>

    <!-- Actions -->
    <ButtonGroup v-if="!showJoinForm">
      <BaseButton
        v-if="isCurrentUserInShoot"
        variant="danger"
        @click="handleLeave"
      >
        Leave Shoot
      </BaseButton>
      <BaseButton
        v-else
        @click="showJoinShoot"
      >
        Join Shoot
      </BaseButton>
      <BaseButton variant="outline" @click="handleClose">
        Close
      </BaseButton>
    </ButtonGroup>
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
  margin-bottom: 1.5rem;
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

.position-indicator {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-text-light, #666);
  color: white;
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
}

.you-indicator {
  font-weight: 400;
  color: var(--color-text-light, #666);
  font-size: 0.8em;
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
  color: var(--color-text);
}

.notification-toggle {
  text-align: center;
  margin-bottom: 1rem;
}

.notification-toggle-btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  color: var(--color-text-mute, #666);
  text-decoration: none;
  border: 1px solid var(--color-border, #eee);
  border-radius: 6px;
  background: var(--color-background-mute, #f8f9fa);
  transition: all 0.2s;
}

.notification-toggle-btn:hover {
  background: var(--color-background-soft, #e9ecef);
  color: var(--color-text);
}

.notification-settings-container {
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
</style>