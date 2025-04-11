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

    // Search query
    searchQuery: "",

    // Card display mode
    compactMode: false
  });

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

  // New functions for distance range
  function updateMinDistance(distance) {
    state.value.minDistance = distance;
  }

  function updateMaxDistance(distance) {
    state.value.maxDistance = distance;
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
    updateMaxDistance
  };
});
