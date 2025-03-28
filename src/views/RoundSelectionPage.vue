<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useHistoryStore } from "@/stores/history";
import { useUserStore } from "@/stores/user";
import { gameTypes } from "@/domain/scoring/game_types";
import { filterGameTypes } from "@/domain/scoring/round_filters"; // Import the domain function
import RoundCard from "@/components/RoundCard.vue";

defineProps({
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
const userStore = useUserStore();

// Filter state - all unselected by default
const indoorSelected = ref(false);
const outdoorSelected = ref(false);
const metricSelected = ref(false);
const imperialSelected = ref(false);
const practiceSelected = ref(false);

// Max distance from user preferences
const maxDistance = ref(userStore.user.maxYards || 100);
const searchQuery = ref("");

// Determine if any environment filter is active
const environmentFilterActive = computed(() =>
  indoorSelected.value || outdoorSelected.value
);

// Determine if any unit filter is active
const unitFilterActive = computed(() =>
  metricSelected.value || imperialSelected.value
);

// Create a computed property for the filter object
const filters = computed(() => {
  // If no environment filters are selected, show all environments
  const showIndoor = environmentFilterActive.value ? indoorSelected.value : true;
  const showOutdoor = environmentFilterActive.value ? outdoorSelected.value : true;

  // If no unit filters are selected, show all units
  const showMetric = unitFilterActive.value ? metricSelected.value : true;
  const showImperial = unitFilterActive.value ? imperialSelected.value : true;

  // Practice rounds are only shown when explicitly selected
  const showPractice = practiceSelected.value;

  return {
    showIndoor,
    showOutdoor,
    showMetric,
    showImperial,
    showPractice,
    maxDistance: maxDistance.value,
    searchQuery: searchQuery.value
  };
});

const recentTypes = computed(() => history.getRecentGameTypes());
const otherTypes = computed(() =>
  gameTypes.filter(type => !recentTypes.value.includes(type))
);

// Use the domain function to filter rounds
const filteredRecentTypes = computed(() =>
  filterGameTypes(recentTypes.value, filters.value)
);

const filteredOtherTypes = computed(() =>
  filterGameTypes(otherTypes.value, filters.value)
);

function selectRound(type) {
  router.push({
    path: "/",
    query: { selectedRound: type }
  });
}

function toggleIndoor() {
  indoorSelected.value = !indoorSelected.value;
}

function toggleOutdoor() {
  outdoorSelected.value = !outdoorSelected.value;
}

function toggleMetric() {
  metricSelected.value = !metricSelected.value;
}

function toggleImperial() {
  imperialSelected.value = !imperialSelected.value;
}

function togglePractice() {
  practiceSelected.value = !practiceSelected.value;
}

// Update user's max distance when the slider changes
function updateMaxDistance() {
  // Save to user store
  userStore.save(
    userStore.user.ageGroup,
    userStore.user.gender,
    userStore.user.bowType,
    userStore.user.indoorClassifications,
    userStore.user.outdoorClassifications,
    userStore.user.indoorSeasonStartDate,
    userStore.user.outdoorSeasonStartDate,
    maxDistance.value,
    userStore.user.name,
    userStore.user.constructiveCriticism,
    userStore.user.experimentalTargetFace,
    userStore.user.knockColor
  );
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
          :class="{ 'active': indoorSelected }"
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
          :class="{ 'active': outdoorSelected }"
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

        <!-- Metric Filter Button -->
        <button
          class="filter-button"
          :class="{ 'active': metricSelected }"
          @click="toggleMetric"
          aria-label="Show metric rounds"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
            <line x1="10" y1="3" x2="8" y2="21"></line>
            <line x1="16" y1="3" x2="14" y2="21"></line>
          </svg>
          <span class="filter-label">Metric</span>
        </button>

        <!-- Imperial Filter Button -->
        <button
          class="filter-button"
          :class="{ 'active': imperialSelected }"
          @click="toggleImperial"
          aria-label="Show imperial rounds"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <path d="M6 3v18"></path>
            <path d="M18 3v18"></path>
            <path d="M6 8h12"></path>
            <path d="M6 16h12"></path>
          </svg>
          <span class="filter-label">Imperial</span>
        </button>

        <!-- Practice Filter Button -->
        <button
          class="filter-button"
          :class="{ 'active': practiceSelected }"
          @click="togglePractice"
          aria-label="Show practice rounds"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span class="filter-label">Practice</span>
        </button>
      </div>
    </div>

    <!-- Max Distance Slider -->
    <div class="distance-slider-container">
      <label for="max-distance">Maximum Distance: {{ maxDistance }} yards</label>
      <input
        type="range"
        id="max-distance"
        v-model="maxDistance"
        min="10"
        max="100"
        step="10"
        @change="updateMaxDistance"
      />
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
  flex-wrap: wrap; /* Allow wrapping for smaller screens */
  gap: 0.5em; /* Add gap between wrapped items */
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

.distance-slider-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.distance-slider-container label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: 500;
}

.distance-slider-container input[type="range"] {
  width: 100%;
  margin: 0.5em 0;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: var(--color-background-mute);
  border-radius: 4px;
  outline: none;
}

.distance-slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-highlight, #4CAF50);
  cursor: pointer;
}

.distance-slider-container input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-highlight, #4CAF50);
  cursor: pointer;
  border: none;
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
