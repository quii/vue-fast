import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useHistoryStore = defineStore("history",
  () => {
    const state = useLocalStorage('history', [])
    function add(date, score, distance, gameType) {
      state.value.push({
        id: state.value.length + 1,
        date,
        score,
        distance,
        gameType,
      })
    }
    function remove(id) {
      state.value = state.value.filter(item => item.id !== id)
    }

    return { history: state, add, remove }
  }
)