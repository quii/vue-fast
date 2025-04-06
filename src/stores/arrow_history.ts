import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useArrowHistoryStore = defineStore("arrowHistory", () => {
  const state = useLocalStorage("arrow-history", {});

  function saveArrowsForShoot(shootId, arrows) {
    state.value[shootId] = arrows;
  }

  function getArrowsForShoot(shootId) {
    return state.value[shootId] || [];
  }

  return {
    saveArrowsForShoot,
    getArrowsForShoot
  };
});
