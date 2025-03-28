<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig, gameTypes } from "@/domain/scoring/game_types";
import RoundCard from "@/components/RoundCard.vue";

const props = defineProps({
  returnTo: {
    type: String,
    default: "/"
  },
  currentRound: {
    type: String,
    default: ""
  }
});

const router = useRouter();
const history = useHistoryStore();
const searchQuery = ref("");

// Filter state
const showIndoor = ref(true);
const showOutdoor = ref(true);

const recentTypes = computed(() => history.getRecentGameTypes());
const otherTypes = computed(() =>
  gameTypes.filter(type => !recentTypes.value.includes(type))
);

const filteredRecentTypes = computed(() => {
  if (!searchQuery.value) {
    return filterByEnvironment(recentTypes.value);
  }
  return filterByEnvironment(recentTypes.value.filter(type =>
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  ));
});

const filteredOtherTypes = computed(() => {
  if (!searchQuery.value) {
    return filterByEnvironment(otherTypes.value);
  }
  return filterByEnvironment(otherTypes.value.filter(type =>
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  ));
});

function filterByEnvironment(types) {
  return types.filter(type => {
    // Use the gameTypeConfig to determine if a round is indoor or outdoor
    const config = gameTypeConfig[type.toLowerCase()];

    // If config exists and has isOutdoor property
    if (config) {
      const isOutdoor = config.isOutdoor === true;
      const isIndoor = !isOutdoor;

      return (isIndoor && showIndoor.value) || (isOutdoor && showOutdoor.value);
    }

    // Fallback for rounds without config - use string matching
    const lowerType = type.toLowerCase();
    const isOutdoor = lowerType.includes("outdoor") || lowerType.includes("field");
    const isIndoor = !isOutdoor;

    return (isIndoor && showIndoor.value) || (isOutdoor && showOutdoor.value);
  });
}

function selectRound(type) {
  router.push({
    path: "/",
    query: { selectedRound: type }
  });
}

function toggleIndoor() {
  showIndoor.value = !showIndoor.value;
  // Ensure at least one filter is active
  if (!showIndoor.value && !showOutdoor.value) {
    showOutdoor.value = true;
  }
}

function toggleOutdoor() {
  showOutdoor.value = !showOutdoor.value;
  // Ensure at least one filter is active
  if (!showIndoor.value && !showOutdoor.value) {
    showIndoor.value = true;
  }
}
</script>

<template>
  <div class="round-selection-page">
    <!-- Filters at the top, styled like TopBar.vue -->
    <div class="filters-container">
      <div class="filters">
        <!-- Indoor Filter Button -->
        <button
          class="filter-button"
          :class="{ 'active': showIndoor }"
          @click="toggleIndoor"
          aria-label="Show indoor rounds"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          <span class="filter-label">Indoor</span>
        </button>

        <!-- Outdoor Filter Button -->
        <button
          class="filter-button"
          :class="{ 'active': showOutdoor }"
          @click="toggleOutdoor"
          aria-label="Show outdoor rounds"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <span class="filter-label">Outdoor</span>
        </button>
      </div>
    </div>

    <!-- Search bar -->
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Search rounds..." />
    </div>

    <!-- Round lists -->
    <div class="rounds-container">
      <div v-if="filteredRecentTypes.length">
        <h3>Recent Rounds</h3>
        <div class="round-list">
          <RoundCard
            v-for="type in filteredRecentTypes"
            :key="type"
            :round="{ round: type }"
            @click="selectRound(type)"
          />
        </div>
      </div>

      <div>
        <h3>All Rounds</h3>
        <div class="round-list">
          <RoundCard
            v-for="type in filteredOtherTypes"
            :key="type"
            :round="{ round: type }"
            @click="selectRound(type)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.round-selection-page {
  padding: 0.5em;
}

.filters-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin-bottom: 1em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters {
  display: flex;
  justify-content: space-around;
  padding: 0.75em 0.5em;
}

.filter-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--color-background);
  border: none;
  color: var(--color-text-light);
  transition: all 0.2s ease;
  padding: 0.5em;
  cursor: pointer;
}

.filter-button:active {
  transform: scale(0.95);
}

.filter-button.active {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
}

.filter-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 0.25em;
}

.filter-label {
  font-size: 0.7em;
  font-weight: 500;
}

.search-container {
  margin-bottom: 1em;
}

.search-container input {
  width: 100%;
  padding: 0.75em;
  font-size: 1em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.rounds-container {
  margin-bottom: 2em;
}

.rounds-container h3 {
  margin: 1em 0 0.5em 0;
  font-size: 1.1em;
  color: var(--color-text-light);
}

.round-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

@media (min-width: 768px) {
  .filters {
    justify-content: center;
    gap: 1.5rem;
  }

  .filter-button {
    width: 70px;
  }
}
</style>
