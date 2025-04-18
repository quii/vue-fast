import { mallyMalhamBowTypeFix } from "@/domain/user_data_fixer.js";
import { useUserStore } from "@/stores/user.js";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { createPlayerHistory } from "@/domain/repositories/player_history.js";

export const useHistoryStore = defineStore("history", () => {
  const state = useLocalStorage("history", []);

  const userStore = useUserStore();

  const currentUserProfile = computed(() => ({
    gender: userStore.user.gender,
    ageGroup: userStore.user.ageGroup,
    bowType: userStore.user.bowType,
    classification: userStore.user.classification
  }));

  const playerHistory = createPlayerHistory(state, currentUserProfile.value);

  setTimeout(async () => {
    await playerHistory.backfillClassifications()
  }, 0)

  return {
    history: state,
    ...playerHistory
  };
});