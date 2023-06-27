import { computed } from "vue";
import { defineStore } from 'pinia'
import { calculateGoldCount, calculateHitsCount, calculateRounds, calculateTotal } from "@/domain/scores";
import { useLocalStorage } from "@vueuse/core";

export const useScoresStore = defineStore("scores",
  () => {
    const state = useLocalStorage('scores', [])
    const runningTotal = computed(() => calculateTotal(state.value));
    const totalGolds = computed(() => calculateGoldCount(state.value));
    const totalHits = computed(() => calculateHitsCount(state.value));
    const rounds = computed(() => calculateRounds(state.value));

    function add(value) {
      state.value.push(value);
    }

    function clear() {
      state.value = [];
    }

    return { scores: state, add, clear, runningTotal, totalGolds, totalHits, rounds };
  })
