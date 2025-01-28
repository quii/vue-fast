import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";
import { PlayerHistory } from "@/domain/player_history";

export const useHistoryStore = defineStore("history", () => {
  const state = useLocalStorage("history", []);
  const selectedShoot = ref(state.value[0]);
  const playerHistory = new PlayerHistory(state);

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
    importHistory: (history) => playerHistory.importHistory(history),
    sortedHistory: (...args) => playerHistory.sortedHistory(...args),
    personalBest: (round) => playerHistory.personalBest(round),
    totalArrows: () => playerHistory.totalArrows(),
    getRecentGameTypes: () => playerHistory.getRecentGameTypes(),
    getFilteredHistory: (...args) => playerHistory.getFilteredHistory(...args)
  };
});
