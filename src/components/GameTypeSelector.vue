<script setup>
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import RoundCard from "./RoundCard.vue";
import { useRouter } from "vue-router";
import { computed, ref, onMounted } from "vue";
import { useHistoryStore } from "@/stores/history";

const props = defineProps({
  gameType: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["changeGameType"]);
const router = useRouter();
const historyStore = useHistoryStore();

// Compute whether a round is currently selected
const hasSelectedRound = computed(() => {
  return !!props.gameType;
});

// Get recent game types - limited to 3
const recentGameTypes = ref([]);

// Fetch recent game types on component mount
onMounted(async () => {
  // Get all recent game types
  const allRecentTypes = historyStore.getRecentGameTypes();

  // Get the sorted history to determine recency order
  const sortedHistory = await historyStore.sortedHistory();

  // Create a map of game types to their most recent date
  const gameTypeToDateMap = new Map();

  // Populate the map with the most recent date for each game type
  sortedHistory.forEach(item => {
    if (!gameTypeToDateMap.has(item.gameType)) {
      gameTypeToDateMap.set(item.gameType, new Date(item.date));
    }
  });

  // Sort the recent game types by their most recent date
  const sortedRecentTypes = allRecentTypes
    .filter(type => gameTypeToDateMap.has(type))
    .sort((a, b) => {
      const dateA = gameTypeToDateMap.get(a);
      const dateB = gameTypeToDateMap.get(b);
      return dateB - dateA; // Most recent first
    });

  // Take only the 3 most recent
  recentGameTypes.value = sortedRecentTypes.slice(0, 3);
});

// Function to navigate to round selection
function navigateToRoundSelection() {
  router.push({
    name: "selectRound",
    query: {
      returnTo: "score",
      currentRound: props.gameType
    }
  });
}

// Function to select a recent round
function selectRecentRound(roundType) {
  emit("changeGameType", roundType);
}
</script>

<template>
  <div class="round-selector">
    <!-- Show this when a round is selected -->
    <div v-if="hasSelectedRound" class="current-round">
      <div class="current-round-header">
        <div class="current-round-label">Currently shooting</div>
        <span class="tap-to-change" @click="navigateToRoundSelection">tap to change</span>
      </div>
      <div class="round-card-wrapper" @click="navigateToRoundSelection">
        <RoundCard
          :round="{ round: gameType }"
        />
      </div>
    </div>

    <!-- Show this when no round is selected -->
    <div v-else class="no-round-selected">
      <div class="select-prompt">Please select a round to shoot:</div>
      <BaseButton
        @click="navigateToRoundSelection"
        variant="primary"
      >
        Select Round
      </BaseButton>
    </div>

    <!-- Recent Rounds Section - limited to 3 most recent -->
    <div v-if="recentGameTypes.length > 0" class="recent-rounds-section">
      <div class="recent-rounds-header">
        <h3 class="recent-rounds-title">Recent Rounds</h3>
        <span class="tap-to-select">tap to select</span>
      </div>
      <div class="recent-rounds-list">
        <div
          v-for="roundType in recentGameTypes"
          :key="roundType"
          @click="selectRecentRound(roundType)"
          class="recent-round-item"
        >
          <RoundCard
            :round="{ round: roundType }"
            :compact="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.round-selector {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.current-round-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.current-round-label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1rem;
}

.tap-to-change {
  font-size: 0.75rem;
  color: var(--color-text-light, #888);
  font-style: italic;
}

.round-card-wrapper {
  cursor: pointer;
  transition: transform 0.1s ease;
}

.round-card-wrapper:active {
  transform: scale(0.98);
}

.select-prompt {
  text-align: center;
  margin-bottom: 0.5rem;
}

.current-round {
  display: flex;
  flex-direction: column;
}

/* Recent Rounds Section Styles */
.recent-rounds-section {
  margin-top: 0.5rem;
}

.recent-rounds-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.recent-rounds-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.tap-to-select {
  font-size: 0.75rem;
  color: var(--color-text-light, #888);
  font-style: italic;
}

.recent-rounds-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-round-item {
  cursor: pointer;
  transition: transform 0.1s ease;
}

.recent-round-item:active {
  transform: scale(0.98);
}
</style>
