import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";
import { NewPlayerHistory } from "@/domain/player_history";

export const useHistoryStore = defineStore("history", () => {
  const state = useLocalStorage("history", []);
  const selectedShoot = ref(state.value[0]);

  const playerHistory = NewPlayerHistory(state);

  function setShootToView(id) {
    id = parseInt(id);
    return (selectedShoot.value = state.value.find((shoot) => shoot.id == id));
  }

  return {
    history: state,
    ...playerHistory,
    setShootToView,
    selectedShoot
  };
});

