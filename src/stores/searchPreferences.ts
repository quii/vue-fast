import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useSearchPreferencesStore = defineStore("searchPreferences", () => {
  // Define default values for all filter preferences
  const state = useLocalStorage("searchPreferences", {
    // Filter toggles
    indoorSelected: false,
    outdoorSelected: false,
    metricSelected: false,
    imperialSelected: false,
    practiceSelected: false,
    challengingRoundsOnly: true,

    // Distance range filters
    minDistance: 0,
    maxDistance: 100,
    distanceUnit: "yards",

    // Search query
    searchQuery: "",

    // Card display mode
    compactMode: false
  });


  // Validate and sanitize distance values
  function sanitizeDistanceValues() {
    // Check if minDistance is NaN or invalid
    if (isNaN(state.value.minDistance) || state.value.minDistance === null || state.value.minDistance === undefined) {
      state.value.minDistance = 0;
    }

    // Check if maxDistance is NaN or invalid
    if (isNaN(state.value.maxDistance) || state.value.maxDistance === null || state.value.maxDistance === undefined) {
      state.value.maxDistance = 100;
    }

    // Ensure minDistance is not negative
    state.value.minDistance = Math.max(0, state.value.minDistance);

    // Ensure maxDistance is at least minDistance
    state.value.maxDistance = Math.max(state.value.minDistance, state.value.maxDistance);
  }

  // Run validation on initial load
  sanitizeDistanceValues();

  // Function to update all preferences at once
  function updatePreferences(preferences) {
    state.value = {
      ...state.value,
      ...preferences
    };
  }

  // Individual update functions for each preference
  function toggleIndoor() {
    state.value.indoorSelected = !state.value.indoorSelected;
  }

  function toggleOutdoor() {
    state.value.outdoorSelected = !state.value.outdoorSelected;
  }

  function toggleMetric() {
    state.value.metricSelected = !state.value.metricSelected;
  }

  function toggleImperial() {
    state.value.imperialSelected = !state.value.imperialSelected;
  }

  function togglePractice() {
    state.value.practiceSelected = !state.value.practiceSelected;
  }

  function toggleChallengingRounds() {
    state.value.challengingRoundsOnly = !state.value.challengingRoundsOnly;
  }

  function toggleCompactMode() {
    state.value.compactMode = !state.value.compactMode;
  }

  function updateSearchQuery(query) {
    state.value.searchQuery = query;
  }

  function updateMinDistance(distance) {
    // Convert to number and validate
    const numDistance = Number(distance);
    state.value.minDistance = isNaN(numDistance) ? 0 : numDistance;

    // Ensure maxDistance is at least minDistance
    if (state.value.maxDistance < state.value.minDistance) {
      state.value.maxDistance = state.value.minDistance;
    }
  }

  function updateMaxDistance(distance) {
    // Convert to number and validate
    const numDistance = Number(distance);
    state.value.maxDistance = isNaN(numDistance) ? 100 : numDistance;

    // Ensure minDistance is not greater than maxDistance
    if (state.value.minDistance > state.value.maxDistance) {
      state.value.minDistance = state.value.maxDistance;
    }
  }

  function toggleDistanceUnit() {
    state.value.distanceUnit = state.value.distanceUnit === "yards" ? "meters" : "yards";
  }

  return {
    preferences: state,
    updatePreferences,
    toggleIndoor,
    toggleOutdoor,
    toggleMetric,
    toggleImperial,
    togglePractice,
    toggleChallengingRounds,
    toggleCompactMode,
    updateSearchQuery,
    updateMinDistance,
    updateMaxDistance,
    toggleDistanceUnit
  };
});
