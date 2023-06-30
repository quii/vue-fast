import { computed } from "vue";
import { defineStore } from 'pinia'
import { calculateGoldCount, calculateHitsCount, calculateRounds, calculateTotal } from "@/domain/scores";
import { useLocalStorage } from "@vueuse/core";
import { gameTypes } from "@/domain/game_types";

export const useScoresStore = defineStore("scores",
  () => {
    const state = useLocalStorage('scores', [])
    const gameType = useLocalStorage('game', gameTypes[0])
    const runningTotal = computed(() => calculateTotal(state.value));
    const totalGolds = computed(() => calculateGoldCount(state.value));
    const totalHits = computed(() => calculateHitsCount(state.value));
    const rounds = computed(() => calculateRounds(state.value, gameType.value));

    function add(value) {
      state.value.push(value);
    }

    function setGameType(value) {
      gameType.value = value
    }

    function clear() {
      state.value = [];
    }

    function undo() {
      state.value.pop();
    }

    return { scores: state, gameType, setGameType, add, clear, runningTotal, totalGolds, totalHits, rounds, undo };
  })
