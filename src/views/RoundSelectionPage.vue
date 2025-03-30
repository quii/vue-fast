<script setup>
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useSearchPreferencesStore } from "@/stores/searchPreferences";
import { calculateAppropriateRounds, gameTypes } from "@/domain/scoring/game_types";
import { filterGameTypes } from "@/domain/scoring/round_filters";
import RoundCard from "@/components/RoundCard.vue";
import { classificationList } from "@/domain/scoring/classificationList.js";

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
const userStore = useUserStore();
const searchPreferencesStore = useSearchPreferencesStore();

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

// Max distance from user preferences
const maxDistance = ref(userStore.user.maxYards || 100);

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

// Get appropriate rounds based on user profile
const appropriateRounds = ref({ short: [], medium: [], long: [] });
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
    maxDistance.value,
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
  ).map(round => ({ round, category: "practice" }));
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
    appropriateRounds.value = await calculateAppropriateRounds(
      classification,
      userStore.user.ageGroup,
      userStore.user.gender,
      userStore.user.bowType,
      maxDistance.value
    );

    // Combine all rounds into a single array
    allRoundsList.value = [
      ...appropriateRounds.value.short.map(r => ({ ...r, category: "short" })),
      ...appropriateRounds.value.medium.map(r => ({ ...r, category: "medium" })),
      ...appropriateRounds.value.long.map(r => ({ ...r, category: "long" }))
    ];
  } else {
    allRoundsList.value = [];
  }
});

// Apply additional filters to the appropriate rounds
const filteredRounds = computed(() => {
  if (allRoundsList.value.length === 0 && !practiceSelected.value) {
    return [];
  }

  // Start with the appropriate rounds
  let rounds = [...allRoundsList.value];

  // Add practice rounds if the practice filter is selected
  if (practiceSelected.value) {
    rounds = [...rounds, ...practiceRounds.value];
  }

  // Extract just the round names for filtering
  const roundNames = rounds.map(r => r.round);

  // Apply our filters
  const filteredNames = filterGameTypes(roundNames, filters.value);

  // Return the full round objects that match the filtered names
  return rounds.filter(r => filteredNames.includes(r.round));
});

// Group filtered rounds by category for display
const shortRounds = computed(() => filteredRounds.value.filter(r => r.category === "short"));
const mediumRounds = computed(() => filteredRounds.value.filter(r => r.category === "medium"));
const longRounds = computed(() => filteredRounds.value.filter(r => r.category === "long"));
const practiceRoundsFiltered = computed(() => filteredRounds.value.filter(r => r.category === "practice"));

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

function selectRound(type) {
  router.push({
    path: "/",
    query: { selectedRound: type }
  });
}

// Update user's max distance when the slider changes
function updateMaxDistance() {
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

// Add a function to toggle challenge mode
function toggleChallengingRounds() {
  searchPreferencesStore.toggleChallengingRounds();
}
</script>

<template>
  <div class="round-selection-page">
    <!-- User Profile Setup Section (shown when details are missing) -->
    <div v-if="!userHasRequiredDetails" class="profile-setup-section">
      <h2>Complete Your Profile</h2>
      <p>To see rounds that match your skill level, please provide the following information:</p>

      <div class="profile-form">
        <div class="form-group">
          <label for="age-group">Age Group</label>
          <select id="age-group" v-model="selectedAgeGroup" @change="saveUserProfile">
            <option disabled value="">Select age group</option>
            <option>50+</option>
            <option value="senior">Senior</option>
            <option value="u21">Under 21</option>
            <option value="u18">Under 18</option>
            <option value="u16">Under 16</option>
            <option value="u15">Under 15</option>
            <option value="u14">Under 14</option>
            <option value="u12">Under 12</option>
          </select>
        </div>

        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" v-model="selectedGender" @change="saveUserProfile">
            <option disabled value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div class="form-group">
          <label for="bow-type">Bow Type</label>
          <select id="bow-type" v-model="selectedBowtype" @change="saveUserProfile">
            <option disabled value="">Select bow type</option>
            <option value="recurve">Recurve</option>
            <option value="barebow">Barebow</option>
            <option value="longbow">Longbow</option>
            <option value="compound">Compound</option>
          </select>
        </div>

        <div v-if="selectedBowtype" class="form-group">
          <label for="outdoor-classification">{{ selectedBowtype.charAt(0).toUpperCase() + selectedBowtype.slice(1) }}
            Outdoor Classification</label>
          <select
            id="outdoor-classification"
            v-model="outdoorClassifications[selectedBowtype]"
            @change="updateOutdoorClassification(selectedBowtype, outdoorClassifications[selectedBowtype]); saveUserProfile()"
          >
            <option>Unclassified</option>
            <option v-for="option in classificationList" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select>
          <p class="help-text">If you're unsure, select "Unclassified"</p>
        </div>

        <div v-if="selectedBowtype" class="form-group">
          <label for="indoor-classification">{{ selectedBowtype.charAt(0).toUpperCase() + selectedBowtype.slice(1) }}
            Indoor Classification</label>
          <select
            id="indoor-classification"
            v-model="indoorClassifications[selectedBowtype]"
            @change="updateIndoorClassification(selectedBowtype, indoorClassifications[selectedBowtype]); saveUserProfile()"
          >
            <option>Unclassified</option>
            <option v-for="option in classificationList" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select>
          <p class="help-text">If you're unsure, select "Unclassified"</p>
        </div>
      </div>

      <div class="profile-note">
        <p>You can update these details anytime in the "You" tab.</p>
      </div>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
              <!-- House/Home icon -->
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span class="filter-label">Practice</span>
          </button>

          <!-- Challenge Mode Filter Button - updated with consistent label -->
          <button
            class="filter-button challenge-button"
            :class="{ 'active': challengingRoundsOnly }"
            @click="toggleChallengingRounds"
            aria-label="Show rounds appropriate for your level"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span class="filter-label">For You</span>
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

      <!-- Message when no rounds match filters -->
      <div v-if="filteredRounds.length === 0" class="no-rounds-message">
        <p>No rounds match your current filters. Try adjusting your filters or increasing your maximum distance.</p>
      </div>

      <!-- Rounds categorized by length -->
      <div v-if="filteredRounds.length > 0" class="rounds-container">
        <div v-if="practiceRoundsFiltered.length > 0" class="round-category">
          <h3>Practice Rounds</h3>
          <div class="round-list">
            <RoundCard
              v-for="round in practiceRoundsFiltered"
              :key="round.round"
              :round="round"
              @click="selectRound(round.round)"
            />
          </div>
        </div>

        <div v-if="shortRounds.length > 0" class="round-category">
          <h3>Short Rounds</h3>
          <div class="round-list">
            <RoundCard
              v-for="round in shortRounds"
              :key="round.round"
              :round="round"
              @click="selectRound(round.round)"
            />
          </div>
        </div>

        <div v-if="mediumRounds.length > 0" class="round-category">
          <h3>Medium Rounds</h3>
          <div class="round-list">
            <RoundCard
              v-for="round in mediumRounds"
              :key="round.round"
              :round="round"
              @click="selectRound(round.round)"
            />
          </div>
        </div>

        <div v-if="longRounds.length > 0" class="round-category">
          <h3>Long Rounds</h3>
          <div class="round-list">
            <RoundCard
              v-for="round in longRounds"
              :key="round.round"
              :round="round"
              @click="selectRound(round.round)"
            />
          </div>
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

.round-category {
  margin-bottom: 1.5em;
}

.round-category h4 {
  margin: 0.5em 0;
  font-size: 1em;
  color: var(--color-text-light);
}

.all-rounds-section h3 {
  margin: 1em 0 0.5em 0;
  font-size: 1.2em;
  color: var(--color-text);
}

.all-rounds-section h4 {
  margin: 0.5em 0;
  font-size: 1em;
  color: var(--color-text-light);
}

/* Challenge button styles */
.challenge-button {
  position: relative;
}
</style>