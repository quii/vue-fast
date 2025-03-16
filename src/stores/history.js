import { useUserStore } from "@/stores/user.js";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";
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

  const playerHistory = new PlayerHistory(state, currentUserProfile.value);

  return {
    history: state,
    selectedShoot,
    setShootToView(id) {
      id = parseInt(id);
      return (selectedShoot.value = state.value.find((shoot) => shoot.id == id));
    },
    getAvailableRounds: () => playerHistory.getAvailableRounds(),
    add: (...args) => playerHistory.add(...args),
    remove: (id) => playerHistory.remove(id),
    importHistory: (history, userProfile) => playerHistory.importHistory(history, userProfile),
    sortedHistory: (...args) => playerHistory.sortedHistory(...args),
    personalBest: (round) => playerHistory.personalBest(round),
    totalArrows: () => playerHistory.totalArrows(),
    getRecentGameTypes: () => playerHistory.getRecentGameTypes(),
    getFilteredHistory: (...args) => playerHistory.getFilteredHistory(...args)
  };
});
