<script setup>
import { computed, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import { useUserStore } from '@/stores/user'
import ParticipantList from '@/components/leaderboard/ParticipantList.vue'
import { groupParticipantsByRound, getUniqueRoundNames } from '../../../shared/models/Shoot'
import { findBestEnds } from '../../../shared/models/BestEnd'

const props = defineProps({
  shoot: {
    type: Object,
    required: true
  },
  groupByRound: {
    type: Boolean,
    default: true
  },
  viewerMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['leave', 'join'])

const userStore = useUserStore()

// Computed
const participants = computed(() => {
  return props.shoot?.participants || []
})

const groupedParticipants = computed(() => {
  if (!props.groupByRound) {
    return null
  }
  return groupParticipantsByRound(participants.value)
})

const roundNames = computed(() => {
  if (!props.groupByRound) {
    return []
  }
  return getUniqueRoundNames(participants.value)
})

const currentUserParticipant = computed(() => {
  return participants.value.find(p => p.archerName === userStore.user.name)
})

const isCurrentUserInShoot = computed(() => {
  return !!currentUserParticipant.value
})

const bestEnds = computed(() => {
  if (!props.groupByRound || !props.shoot) {
    return []
  }
  return findBestEnds(props.shoot)
})
</script>

<template>
  <div class="leaderboard-display">
    <div class="leaderboard-container">
      <div v-if="participants.length === 0" class="empty-state">
        <p>No archers have joined yet.</p>
        <p class="empty-hint">Share the shoot code for others to join!</p>
      </div>

      <!-- Grouped by round view -->
      <div v-else-if="groupByRound" class="grouped-leaderboard">
        <div v-if="roundNames.length === 0" class="empty-state">
          <p>No participants found.</p>
        </div>
        <div v-else class="round-groups">
          <ParticipantList
            v-for="roundName in roundNames"
            :key="roundName"
            :participants="groupedParticipants[roundName]"
            :title="roundName || 'No Round Specified'"
            :best-ends="bestEnds"
            class="round-group"
          />
        </div>
      </div>

      <!-- Standard ungrouped view -->
      <ParticipantList
        v-else
        :participants="participants"
      />

      <!-- Join button for non-participants (only if not in viewer mode) -->
      <div v-if="!viewerMode && !isCurrentUserInShoot" class="join-action">
        <BaseButton @click="$emit('join')">
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

.grouped-leaderboard {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.round-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.round-group {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border, #eee);
}

.round-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.leaderboard-card.is-finished .card-score {
  color: var(--color-success, #28a745);
}
</style>