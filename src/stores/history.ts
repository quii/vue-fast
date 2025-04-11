import { mallyMalhamBowTypeFix } from "@/domain/user_data_fixer.js";
import { useUserStore } from "@/stores/user.js";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { PlayerHistory } from "@/domain/repositories/player_history.js";

export const useHistoryStore = defineStore("history", () => {
  const state = useLocalStorage("history", []);
  const selectedShoot = ref(state.value[0]);

  const userStore = useUserStore();

  // Get current user profile for backfilling
  const currentUserProfile = computed(() => ({
    gender: userStore.user.gender,
    ageGroup: userStore.user.ageGroup,
    bowType: userStore.user.bowType,
    classification: userStore.user.classification
  }));

  // Apply Mally's special fix if needed
  watchEffect(() => {
    if (userStore.user.name === "Mally Malham") {
      // Use the separate function from user_data_fixer.js
      state.value = mallyMalhamBowTypeFix(state.value);
    }
  });

  const playerHistory = new PlayerHistory(state, currentUserProfile.value);

  return {
    history: state,
    selectedShoot,
    setShootToView(id) {
      id = parseInt(id);
      return (selectedShoot.value = state.value.find((shoot) => shoot.id == id));
    },
    getAvailableRounds: () => playerHistory.getAvailableRounds(),
    getBowTypesUsed: (currentBowType) => playerHistory.getBowTypesUsed(currentBowType),
    add: (...args) => playerHistory.add(...args),
    updateShoot: (...args) => playerHistory.updateShoot(...args),
    remove: (id) => playerHistory.remove(id),
    importHistory: (history, userProfile) => playerHistory.importHistory(history, userProfile),
    sortedHistory: (...args) => playerHistory.sortedHistory(...args),
    personalBest: (round) => playerHistory.personalBest(round),
    totalArrows: () => playerHistory.totalArrows(),
    getRecentGameTypes: () => playerHistory.getRecentGameTypes(),
    getFilteredHistory: (...args) => playerHistory.getFilteredHistory(...args)
  };
});