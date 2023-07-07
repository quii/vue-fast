import { defineStore } from "pinia";
import { useLocalStorage, useStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { calculateGoldCount, calculateHitsCount, calculateRounds, calculateTotal } from "@/domain/scores";

export const useHistoryStore = defineStore("history",
  () => {
    const state = useLocalStorage("history", []);

    const selectedShoot = ref(state.value[0]);

    function add(date, score, distance, gameType, scores) {
      state.value.push({
        id: state.value.length + 1,
        date,
        score,
        distance,
        gameType,
        scores
      });
    }

    function remove(id) {
      state.value = state.value.filter(item => item.id !== id);
    }

    function importHistory(history) {
      state.value = history;
    }

    function setShootToView(index) {
      return selectedShoot.value = state.value[index];
    }

    const runningTotal = computed(() => calculateTotal(selectedShoot.value.scores));
    const totalGolds = computed(() => calculateGoldCount(selectedShoot.value.scores));
    const totalHits = computed(() => calculateHitsCount(selectedShoot.value.scores));
    const rounds = computed(() => calculateRounds(selectedShoot.value.scores, selectedShoot.value.gameType));


    return {
      history: state,
      add,
      remove,
      importHistory,
      setShootToView,
      runningTotal,
      totalGolds,
      totalHits,
      rounds,
      selectedShoot,
    };
  })