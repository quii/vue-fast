<script setup>
import CardModeToggle from "@/components/CardModeToggle.vue";
import RoundCard from "@/components/RoundCard.vue";
import RoundSelectionTipModal from '@/components/modals/RoundSelectionTipModal.vue'
import IndoorIcon from '@/components/icons/IndoorIcon.vue'
import OutdoorIcon from '@/components/icons/OutdoorIcon.vue'
import MetricIcon from '@/components/icons/MetricIcon.vue'
import ImperialIcon from '@/components/icons/ImperialIcon.vue'
import PracticeIcon from '@/components/icons/PracticeIcon.vue'
import TargetIcon from '@/components/icons/TargetIcon.vue'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import FormGroup from '@/components/ui/FormGroup.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import UserProfileForm from '@/components/forms/UserProfileForm.vue'
import DistanceSliders from '@/components/DistanceSliders.vue'
import { meters, toMeters, toYards, yards } from "@/domain/distance/distance.js";
import { classificationList } from "@/domain/scoring/classificationList.js";
import { gameTypes } from "@/domain/scoring/game_types";
import { calculateAppropriateRounds } from "@/domain/scoring/round_calculator.js";
import { filterRounds } from "@/domain/scoring/round_filters";
import { useSearchPreferencesStore } from "@/stores/searchPreferences";
import { useUserStore } from "@/stores/user";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePreferencesStore } from '@/stores/preferences'

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

onMounted(() => {
  searchPreferencesStore.updateSearchQuery("");
});

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const searchPreferencesStore = useSearchPreferencesStore();
const preferencesStore = usePreferencesStore()
const manuallyTriggeredTip = ref(false)

// Compute whether to show the tip based on conditions
const showRoundSelectionTip = computed(() => {
  // Show if:
  // 1. User has required details AND
  // 2. Either they haven't seen the tip before OR they manually triggered it
  return userHasRequiredDetails.value &&
    (manuallyTriggeredTip.value || !preferencesStore.hasSeenRoundSelectionTip)
})

// Function to manually show the tip
const manuallyShowTip = () => {
  if (userHasRequiredDetails.value) {
    manuallyTriggeredTip.value = true
  }
}

// User profile state
const selectedAgeGroup = ref(userStore.user.ageGroup || "");
const selectedGender = ref(userStore.user.gender || "");
const selectedBowtype = ref(userStore.user.bowType || "");

// Classifications by bow type
const indoorClassifications = ref({ ...(userStore.user.indoorClassifications || {}) });
const outdoorClassifications = ref({ ...(userStore.user.outdoorClassifications || {}) });

// Use the stored preferences for filter state
const indoorSelected = computed({
  get: () => searchPreferencesStore.preferences.indoorSelected,
  set: (value) => searchPreferencesStore.updatePreferences({ indoorSelected: value })
});

const outdoorSelected = computed({
  get: () => searchPreferencesStore.preferences.outdoorSelected,
  set: (value) => searchPreferencesStore.updatePreferences({ outdoorSelected: value })
});

const metricSelected = computed({
  get: () => searchPreferencesStore.preferences.metricSelected,
  set: (value) => searchPreferencesStore.updatePreferences({ metricSelected: value })
});

const imperialSelected = computed({
  get: () => searchPreferencesStore.preferences.imperialSelected,
  set: (value) => searchPreferencesStore.updatePreferences({ imperialSelected: value })
});

const practiceSelected = computed({
  get: () => searchPreferencesStore.preferences.practiceSelected,
  set: (value) => searchPreferencesStore.updatePreferences({ practiceSelected: value })
});

const challengingRoundsOnly = computed({
  get: () => searchPreferencesStore.preferences.challengingRoundsOnly,
  set: (value) => searchPreferencesStore.updatePreferences({ challengingRoundsOnly: value })
});

const searchQuery = computed({
  get: () => searchPreferencesStore.preferences.searchQuery,
  set: (value) => searchPreferencesStore.updatePreferences({ searchQuery: value })
});

const compactMode = computed({
  get: () => searchPreferencesStore.preferences.compactMode,
  set: (value) => searchPreferencesStore.updatePreferences({ compactMode: value })
});

const minDistance = computed({
  get: () => searchPreferencesStore.preferences.minDistance,
  set: (value) => searchPreferencesStore.updateMinDistance(value)
});

const maxDistance = computed({
  get: () => searchPreferencesStore.preferences.maxDistance,
  set: (value) => searchPreferencesStore.updateMaxDistance(value)
});

const distanceUnit = computed({
  get: () => searchPreferencesStore.preferences.distanceUnit,
  set: (value) => searchPreferencesStore.updatePreferences({ distanceUnit: value })
});

const displayedMinDistance = computed({
  get: () => {
    if (distanceUnit.value === "meters") {
      return Math.round(toMeters(yards(minDistance.value))) + 1; //+1 is a bit of a hack to get around rounding issues
    }
    return minDistance.value;
  },
  set: (value) => {
    if (distanceUnit.value === "meters") {
      // Convert from meters to yards for storage
      updateMinDistanceConstrained(Math.round(toYards(meters(value))));
    } else {
      updateMinDistanceConstrained(value);
    }
  }
});

const displayedMaxDistance = computed({
  get: () => {
    if (distanceUnit.value === "meters") {
      return Math.round(toMeters(yards(maxDistance.value)));
    }
    return maxDistance.value;
  },
  set: (value) => {
    if (distanceUnit.value === "meters") {
      // Convert from meters to yards for storage
      updateMaxDistanceConstrained(Math.round(toYards(meters(value))));
    } else {
      updateMaxDistanceConstrained(value);
    }
  }
});

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
    minDistance: minDistance.value,
    searchQuery: searchQuery.value
  };
});

// Get appropriate rounds based on user profile
const allRoundsList = ref([]);

// Check if user has all required details
const userHasRequiredDetails = computed(() =>
  selectedGender.value &&
  selectedAgeGroup.value &&
  selectedBowtype.value &&
  outdoorClassifications.value[selectedBowtype.value]
);

// Function to save user profile
function saveUserProfile() {
  userStore.save(
    selectedAgeGroup.value,
    selectedGender.value,
    selectedBowtype.value,
    indoorClassifications.value,
    outdoorClassifications.value,
    userStore.user.indoorSeasonStartDate,
    userStore.user.outdoorSeasonStartDate,
    userStore.user.name,
    userStore.user.constructiveCriticism,
    userStore.user.experimentalTargetFace,
    userStore.user.knockColor
  );
}

// Update indoor classification
function updateIndoorClassification(bowType, classification) {
  indoorClassifications.value = {
    ...indoorClassifications.value,
    [bowType]: classification
  };
}

// Update outdoor classification
function updateOutdoorClassification(bowType, classification) {
  outdoorClassifications.value = {
    ...outdoorClassifications.value,
    [bowType]: classification
  };
}

// Initialize classifications when bow type changes
watchEffect(() => {
  if (selectedBowtype.value && !indoorClassifications.value[selectedBowtype.value]) {
    indoorClassifications.value = {
      ...indoorClassifications.value,
      [selectedBowtype.value]: "Unclassified"
    };
  }

  if (selectedBowtype.value && !outdoorClassifications.value[selectedBowtype.value]) {
    outdoorClassifications.value = {
      ...outdoorClassifications.value,
      [selectedBowtype.value]: "Unclassified"
    };
  }
});

// Get practice rounds
const practiceRounds = computed(() => {
  return gameTypes.filter(type =>
    type.toLowerCase().includes("practice")
  );
});


// Fetch appropriate rounds when component mounts or when max distance or challenge mode changes
watchEffect(async () => {
  if (userHasRequiredDetails.value) {
    // Get the classification for the current bow type
    // If challenging rounds only is disabled, use "Unclassified" to show all rounds
    const classification = challengingRoundsOnly.value
      ? userStore.user.outdoorClassifications[userStore.user.bowType] || "Unclassified"
      : "Unclassified";

    // Calculate appropriate rounds
    allRoundsList.value = await calculateAppropriateRounds(
      classification,
      userStore.user.ageGroup,
      userStore.user.gender,
      userStore.user.bowType,
      maxDistance.value
    );
  } else {
    allRoundsList.value = [];
  }
});

// Apply additional filters to the appropriate rounds
const filteredRounds = computed(() => {
  if (allRoundsList.value.length === 0 && !practiceSelected.value) {
    return [];
  }

  return filterRounds([...allRoundsList.value, ...practiceRounds.value], filters.value);
});

const practiceRoundsFiltered = computed(() => filteredRounds.value.filter(r => r.includes("practice")));

// Toggle functions now use the store methods
function toggleIndoor() {
  searchPreferencesStore.toggleIndoor();
}

function toggleOutdoor() {
  searchPreferencesStore.toggleOutdoor();
}

function toggleMetric() {
  searchPreferencesStore.toggleMetric();
}

function toggleImperial() {
  searchPreferencesStore.toggleImperial();
}

function togglePractice() {
  searchPreferencesStore.togglePractice();
}

function clearSearch() {
  searchPreferencesStore.updateSearchQuery("");
}

function selectRound(type) {
  if (route.query.manualEntry === 'true') {
    router.push({
      path: '/history',
      query: {
        selectedRound: type,
        manualEntry: 'true'
      }
    });
  } else if (route.query.returnTo === 'history') {
    router.push({
      path: '/history',
      query: {
        selectedRound: type,
        manualEntry: 'true'
      }
    });
  } else {
    router.push({
      path: "/",
      query: { selectedRound: type }
    });
  }
}

function updateMinDistanceConstrained(value) {
  // Ensure min distance doesn't exceed max distance
  const newValue = Math.min(parseInt(value), maxDistance.value);
  searchPreferencesStore.updateMinDistance(newValue);
}

function updateMaxDistanceConstrained(value) {
  // Ensure max distance isn't less than min distance
  const newValue = Math.max(parseInt(value), minDistance.value);
  searchPreferencesStore.updateMaxDistance(newValue);
}

// Add a function to toggle challenge mode
function toggleChallengingRounds() {
  searchPreferencesStore.toggleChallengingRounds();
}

function handleReset() {
  // Reset all filters to default values
  searchPreferencesStore.updateSearchQuery('')
  searchPreferencesStore.updatePreferences({
    indoorSelected: true,
    outdoorSelected: true,
    metricSelected: true,
    imperialSelected: true,
    practiceSelected: false,
    challengingRoundsOnly: false,
    minDistance: 0,
    maxDistance: 100
  })
}

function dismissRoundSelectionTip() {
  preferencesStore.dismissRoundSelectionTip()
  manuallyTriggeredTip.value = false
}

function handleProfileSubmit(profileData) {
  // Update the local reactive refs with the submitted data
  selectedAgeGroup.value = profileData.ageGroup
  selectedGender.value = profileData.gender
  selectedBowtype.value = profileData.bowType
  indoorClassifications.value = profileData.indoorClassifications
  outdoorClassifications.value = profileData.outdoorClassifications

  // Save to the user store
  saveUserProfile()
}

</script>

<template>
  <div class="round-selection-page">
    <!-- Show the tip modal if the user hasn't seen it yet or if manually triggered -->
    <RoundSelectionTipModal v-if="showRoundSelectionTip" @close="dismissRoundSelectionTip" />

    <!-- User Profile Setup Section (shown when details are missing) -->
    <div v-if="!userHasRequiredDetails" class="profile-setup-section">
      <UserProfileForm
        title="Complete Your Profile"
        description="To see rounds that match your skill level, please provide the following information:"
        :show-name="false"
        :initial-age-group="selectedAgeGroup"
        :initial-gender="selectedGender"
        :initial-bow-type="selectedBowtype"
        :initial-indoor-classifications="indoorClassifications"
        :initial-outdoor-classifications="outdoorClassifications"
        submit-text="Save Profile"
        @submit="handleProfileSubmit"
      />
    </div>

    <!-- Only show this section if user has required details -->
    <div v-if="userHasRequiredDetails">
      <!-- Filters at the top -->
      <div class="filters-container">
        <div class="filters">
          <!-- Indoor Filter Button with house icon -->
          <button
            class="filter-button"
            :class="{ 'active': indoorSelected }"
            @click="toggleIndoor"
            aria-label="Show indoor rounds"
          >
            <IndoorIcon class="filter-icon" />
            <span class="filter-label">Indoor</span>
          </button>

          <!-- Outdoor Filter Button -->
          <button
            class="filter-button"
            :class="{ 'active': outdoorSelected }"
            @click="toggleOutdoor"
            aria-label="Show outdoor rounds"
          >
            <OutdoorIcon class="filter-icon" />
            <span class="filter-label">Outdoor</span>
          </button>

          <!-- Metric Filter Button -->
          <button
            class="filter-button"
            :class="{ 'active': metricSelected }"
            @click="toggleMetric"
            aria-label="Show metric rounds"
          >
            <MetricIcon class="filter-icon" />
            <span class="filter-label">Metric</span>
          </button>

          <!-- Imperial Filter Button -->
          <button
            class="filter-button"
            :class="{ 'active': imperialSelected }"
            @click="toggleImperial"
            aria-label="Show imperial rounds"
          >
            <ImperialIcon class="filter-icon" />
            <span class="filter-label">Imperial</span>
          </button>

          <!-- Practice Filter Button -->
          <button
            class="filter-button"
            :class="{ 'active': practiceSelected }"
            @click="togglePractice"
            aria-label="Show practice rounds"
          >
            <PracticeIcon class="filter-icon" />
            <span class="filter-label">Practice</span>
          </button>

          <!-- Challenge Mode Filter Button - updated with consistent label -->
          <button
            class="filter-button challenge-button"
            :class="{ 'active': challengingRoundsOnly }"
            @click="toggleChallengingRounds"
            aria-label="Show rounds appropriate for your level"
          >
            <TargetIcon class="filter-icon" />
            <span class="filter-label">For You</span>
          </button>
        </div>
      </div>

      <!-- Distance Sliders -->
      <DistanceSliders
        :model-min-distance="displayedMinDistance"
        :model-max-distance="displayedMaxDistance"
        :model-unit="distanceUnit"
        @update:min-distance="displayedMinDistance = $event"
        @update:max-distance="displayedMaxDistance = $event"
        @update:unit="distanceUnit = $event"
      />

      <!-- Search bar -->
      <div class="search-container">
        <div class="search-row">
          <div class="search-input-wrapper" :class="{ 'has-filter': searchQuery }">
            <SearchIcon class="search-icon" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search rounds..."
              aria-label="Search rounds"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-search-button"
              aria-label="Clear search"
            >
              <CloseIcon class="clear-icon" />
            </button>
          </div>
          <CardModeToggle v-model="compactMode" />

          <!-- Help button with consistent spacing -->
          <button
            class="help-button"
            @click="manuallyShowTip"
            aria-label="Show help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="help-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>

        <!-- Active filter indicator -->
        <div v-if="searchQuery" class="active-filter-indicator">
          <span class="filter-message">Showing rounds matching "{{ searchQuery }}"</span>
          <button @click="clearSearch" class="clear-filter-button">Clear</button>
        </div>
      </div>

      <!-- Message when no rounds match filters -->
      <div v-if="filteredRounds.length === 0" class="no-rounds-message">
        <p>No rounds match your current filters.</p>
        <ul class="help-suggestions">
          <li>Try increasing your maximum distance (currently {{ displayedMaxDistance }} {{ distanceUnit }})</li>
          <li>Check that you have selected the correct environment (Indoor/Outdoor)</li>
          <li>Clear your search query if you have one</li>
          <li>Try toggling between Metric and Imperial rounds</li>
        </ul>
        <button @click="handleReset" class="reset-filters-button">Reset All Filters</button>
      </div>

      <!-- Rounds categorized by length -->
      <div v-if="filteredRounds.length > 0" class="rounds-container">
        <div v-if="practiceRoundsFiltered.length > 0" class="round-category">
          <div class="round-list">
            <RoundCard
              v-for="round in practiceRoundsFiltered"
              :key="round"
              :round="{round}"
              :compact="compactMode"
              @click="selectRound(round)"
            />
          </div>
        </div>

        <div v-if="filteredRounds.length > 0" class="round-category">
          <RoundCard
            v-for="round in filteredRounds"
            :key="round.round"
            :round="{round}"
            :compact="compactMode"
            @click="selectRound(round)"
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
  font-size: 0.9em;
  font-weight: 500;
}

.search-container {
  margin-bottom: 0.5rem;
}

.search-container :deep(.card-mode-toggle) {
  flex-shrink: 0;
  width: 130px;
}

.search-container :deep(.toggle-button) {
  height: 40px; /* Match this height with the search input */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* Make the button fill the container */
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

.search-row {
  display: flex;
  align-items: stretch;
  gap: 0.5em; /* Consistent gap between all elements */
}

.search-row input {
  flex: 1;
  padding: 0.75em;
  font-size: 1em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  height: 40px;
  box-sizing: border-box;
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

/* Add styles for the classification section */
.classification-section {
  margin-bottom: 2em;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.classification-section h3 {
  margin-top: 0;
  margin-bottom: 1em;
  font-size: 1.2em;
  color: var(--color-text);
}

.round-category h3 {
  margin: 0 0 0.5em 0;
  font-size: 1em;
}

.all-rounds-section h3 {
  margin: 1em 0 0.5em 0;
  font-size: 1.2em;
  color: var(--color-text);
}

.all-rounds-section h4 {
  margin: 0.5em 0;
  font-size: 1em;
}

.challenge-button {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  height: 40px; /* Set explicit height to match toggle button */
  box-sizing: border-box;
}

.search-input-wrapper.has-filter {
  border-color: var(--color-highlight, #4CAF50);
  box-shadow: 0 0 0 1px var(--color-highlight, #4CAF50);
}

.search-icon {
  width: 16px;
  height: 16px;
  margin-left: 12px;
  color: var(--color-text-light, #666);
  flex-shrink: 0; /* Prevent the icon from shrinking */
}

.search-input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 0.75em; /* Adjust padding to maintain vertical centering */
  font-size: 1em;
  color: var(--color-text);
  outline: none;
  height: 100%; /* Fill the height of the wrapper */
  box-sizing: border-box;
}

.clear-search-button {
  background: none;
  border: none;
  padding: 0.5em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-light, #666);
}

.clear-icon {
  width: 16px;
  height: 16px;
}

.active-filter-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5em;
  padding: 0.5em 0.75em;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  font-size: 0.85em;
}

.filter-message {
  color: var(--color-text-light, #666);
  font-style: italic;
}

.clear-filter-button {
  background: none;
  border: none;
  color: var(--color-highlight, #4CAF50);
  font-weight: 600;
  cursor: pointer;
  padding: 0.25em 0.5em;
}

.instruction-panel {
  background-color: var(--color-background-soft);
  border-left: 3px solid var(--color-highlight, #4CAF50);
  padding: 0.75em 1em;
  margin-bottom: 1em;
  border-radius: 4px;
  font-size: 0.9em;
}

.filter-section-label {
  font-size: 0.85em;
  color: var(--color-text-light);
  margin-bottom: 0.5em;
  padding-left: 0.5em;
}

.round-card {
  position: relative;
}

.tap-indicator {
  position: absolute;
  bottom: 5px;
  right: 8px;
  font-size: 0.7em;
  color: var(--color-text-light);
  opacity: 0.7;
}

.game-type-selector {
  margin-top: 1em;
  padding: 0.75em;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  position: relative;
}

.game-type-selector::after {
  content: "Tap to change round";
  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  color: var(--color-text-light);
  opacity: 0.8;
}

.no-rounds-message {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 1em;
  margin: 1em 0;
}

.help-suggestions {
  margin: 0.5em 0;
  padding-left: 1.5em;
  font-size: 0.9em;
}

.reset-filters-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5em 1em;
  margin-top: 0.5em;
  cursor: pointer;
}

.round-selection-tip {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em;
}

.tip-content {
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5em;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dismiss-tip-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75em 1.5em;
  margin-top: 1em;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
}

.round-selection-tip {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em;
}

.tip-content {
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5em;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dismiss-tip-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75em 1.5em;
  margin-top: 1em;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
}

/* Add these styles for the container and help button */
.rounds-content-container {
  position: relative;
  padding-bottom: 60px; /* Add padding at the bottom to make room for the help button */
}

/* Make sure the round-selection-page has position relative */
.round-selection-page {
  padding: 0.5em;
  position: relative;
}

/* Updated search row to ensure consistent spacing */
.search-row {
  display: flex;
  align-items: stretch;
  gap: 0.5em; /* Consistent gap between all elements */
}

/* Make all buttons in the row have the same width for consistency */
.search-container :deep(.card-mode-toggle),
.help-button {
  flex-shrink: 0;
  width: 40px; /* Consistent width for both buttons */
  height: 40px; /* Consistent height */
}

/* Override the card-mode-toggle width if it needs to be wider */
.search-container :deep(.card-mode-toggle) {
  width: auto; /* Let it size based on content */
  min-width: 40px; /* Minimum width */
}

.help-button {
  border-radius: 8px;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.help-button:active {
  transform: scale(0.95);
}

.help-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text);
}

/* Ensure the search input takes up remaining space */
.search-input-wrapper {
  flex: 1;
}

.profile-setup-section {
  max-width: 800px;
  margin: 0 auto;
}

.profile-intro {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.help-text {
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.profile-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--color-background-soft);
  border-left: 3px solid var(--color-highlight, #4CAF50);
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>