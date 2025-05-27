import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { calculateDefaultSeasonDates } from "@/domain/season_dates";

const defaultSeasons = calculateDefaultSeasonDates();

export const useUserStore = defineStore("user", () => {
  // Migration: Check if maxYards exists in user store and migrate it
  const userStore = localStorage.getItem("user");
  if (userStore) {
    try {
      const userData = JSON.parse(userStore);
      if (userData && userData.maxYards !== undefined) {
        // Get existing search preferences or create new ones
        const existingPrefs = localStorage.getItem("searchPreferences");
        let searchPrefs = existingPrefs ? JSON.parse(existingPrefs) : {};

        // Only set maxDistance if it's not already set
        if (searchPrefs.maxDistance === undefined) {
          searchPrefs.maxDistance = userData.maxYards;
          localStorage.setItem("searchPreferences", JSON.stringify(searchPrefs));
        }

        // Remove maxYards from user data
        delete userData.maxYards;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (e) {
      console.error("Error during maxYards migration:", e);
    }
  }

  // First, load the raw data from localStorage to check if migration is needed
  const rawUserData = localStorage.getItem("user");
  let initialUserData = null;

  if (rawUserData) {
    try {
      const parsedData = JSON.parse(rawUserData);

      // Check if we need to migrate from old schema to new schema
      if (parsedData &&
        parsedData.classification &&
        parsedData.bowType &&
        (!parsedData.outdoorClassifications ||
          !parsedData.outdoorClassifications[parsedData.bowType])) {

        // Initialize the classifications objects if they don't exist
        const indoorClassifications = parsedData.indoorClassifications || {};
        const outdoorClassifications = parsedData.outdoorClassifications || {};

        // Migrate the old classification to the new schema
        if (!outdoorClassifications[parsedData.bowType] ||
          outdoorClassifications[parsedData.bowType] === "Unclassified") {
          outdoorClassifications[parsedData.bowType] = parsedData.classification;
        }

        // Ensure there's an indoor classification for this bow type
        if (!indoorClassifications[parsedData.bowType]) {
          indoorClassifications[parsedData.bowType] = "Unclassified";
        }

        // Update the parsed data with the migrated classifications
        parsedData.indoorClassifications = indoorClassifications;
        parsedData.outdoorClassifications = outdoorClassifications;

        // Set the initial user data to the migrated data
        initialUserData = parsedData;
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }
  }

  // Now create the state with either the migrated data or the default
  const state = useLocalStorage("user", initialUserData || {
    lastBackupDate: null,
    // Default season dates calculated dynamically
    indoorSeasonStartDate: defaultSeasons.indoor,
    outdoorSeasonStartDate: defaultSeasons.outdoor,
    // Classifications by bow type
    indoorClassifications: {}, // e.g. { "recurve": "B3", "barebow": "A2" }
    outdoorClassifications: {}, // e.g. { "recurve": "B2", "barebow": "A1" }
    // Other existing properties
    ageGroup: "",
    gender: "",
    bowType: "",
    name: "",
    constructiveCriticism: true,
    experimentalTargetFace: false,
    knockColor: "#FF69B4"
  });

  function save(
    ageGroup,
    gender,
    bowType,
    indoorClassifications,
    outdoorClassifications,
    indoorSeasonStartDate,
    outdoorSeasonStartDate,
    name,
    constructiveCriticism,
    experimentalTargetFace,
    knockColor
  ) {
    state.value = {
      ageGroup,
      gender,
      bowType, // Current bow type
      indoorClassifications,
      outdoorClassifications,
      indoorSeasonStartDate,
      outdoorSeasonStartDate,
      name,
      constructiveCriticism,
      experimentalTargetFace,
      knockColor,
      lastBackupDate: state.value.lastBackupDate
    };
  }

  function updateUser(updates) {
    state.value = {
      ...state.value,
      ...updates
    };
  }

  function updateLastBackupDate() {
    state.value = {
      ...state.value,
      lastBackupDate: new Date().toISOString()
    };
  }

  function needsBackup() {
    const lastBackup = state.value.lastBackupDate;
    if (!lastBackup) return true;

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return new Date(lastBackup) < monthAgo;
  }

  function isExperimentalUser() {
    return state.value.experimentalTargetFace;
  }

  // Reset season dates to defaults based on current date
  function resetSeasonDates() {
    const newDefaults = calculateDefaultSeasonDates();
    state.value.indoorSeasonStartDate = newDefaults.indoor;
    state.value.outdoorSeasonStartDate = newDefaults.outdoor;
  }

  // Get indoor classification for a specific bow type
  function getIndoorClassification(bowType) {
    if (!state.value.indoorClassifications) return "Unclassified";
    return state.value.indoorClassifications[bowType] || "Unclassified";
  }

  // Get outdoor classification for a specific bow type
  function getOutdoorClassification(bowType) {
    if (!state.value.outdoorClassifications) return "Unclassified";
    return state.value.outdoorClassifications[bowType] || "Unclassified";
  }

  // Set indoor classification for a specific bow type
  function setIndoorClassification(bowType, classification) {
    if (!state.value.indoorClassifications) {
      state.value.indoorClassifications = {};
    }
    state.value.indoorClassifications = {
      ...state.value.indoorClassifications,
      [bowType]: classification
    };
  }

  // Set outdoor classification for a specific bow type
  function setOutdoorClassification(bowType, classification) {
    if (!state.value.outdoorClassifications) {
      state.value.outdoorClassifications = {};
    }
    state.value.outdoorClassifications = {
      ...state.value.outdoorClassifications,
      [bowType]: classification
    };
  }

  return {
    user: state,
    save,
    updateUser,
    updateLastBackupDate,
    needsBackup,
    isExperimentalUser,
    getIndoorClassification,
    getOutdoorClassification,
    setIndoorClassification,
    setOutdoorClassification,
    resetSeasonDates
  };
});