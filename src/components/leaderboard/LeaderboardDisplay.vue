<script setup>
import { computed, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import { useUserStore } from '@/stores/user'
import ParticipantList from '@/components/leaderboard/ParticipantList.vue'

const props = defineProps({
  shoot: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['leave', 'join'])

const userStore = useUserStore()


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
</script>

<template>
  <div class="leaderboard-display">
    <div class="leaderboard-container">
      <div v-if="sortedParticipants.length === 0" class="empty-state">
        <p>No archers have joined yet.</p>
        <p class="empty-hint">Share the shoot code for others to join!</p>
      </div>

      <ParticipantList :participants="sortedParticipants" v-else />

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

.join-action {
  margin-top: 1rem;
  text-align: center;
  padding: 1rem 0;
}

.leaderboard-card.is-finished .card-score {
  color: var(--color-success, #28a745);
}
</style>