import { mallyMalhamBowTypeFix } from "@/domain/user_data_fixer.js";
import { useUserStore } from "@/stores/user.js";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref, watchEffect, inject } from "vue";
import { createPlayerHistory, EventEmitter } from '@/domain/repositories/player_history.js'
import type { LocationPort } from '@/domain/ports/location.js'

// Create an adapter that emits window events
const windowEventEmitter: EventEmitter = {
  emit: (eventName, detail) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }
}

export const useHistoryStore = defineStore("history", () => {
  const state = useLocalStorage("history", []);

  const userStore = useUserStore();
  
  // Inject the location service
  const locationService = inject<LocationPort | null>('locationService');

  const currentUserProfile = computed(() => ({
    gender: userStore.user.gender,
    ageGroup: userStore.user.ageGroup,
    bowType: userStore.user.bowType,
    classification: userStore.user.classification
  }));

  // Pass the event emitter and location service to the factory function
  const playerHistory = createPlayerHistory(state, currentUserProfile.value, windowEventEmitter, locationService)

  setTimeout(async () => {
    await playerHistory.backfillClassifications()
  }, 0);

  return {
    history: state,
    ...playerHistory
  };
});