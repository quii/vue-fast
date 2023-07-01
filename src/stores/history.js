import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useHistoryStore = defineStore("history",
  () => {
    const state = useLocalStorage('history', [])
    function add(date, score, distance, gameType, scores) {
      state.value.push({
        id: state.value.length + 1,
        date,
        score,
        distance,
        gameType,
        scores,
      })
    }
    function remove(id) {
      state.value = state.value.filter(item => item.id !== id)
    }

    function importHistory(history) {
      state.value = history
    }

    return { history: state, add, remove, importHistory }
  }
)