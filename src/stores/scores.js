import { defineStore } from 'pinia'
import { useLocalStorage } from "@vueuse/core";
import { gameTypes } from "@/domain/game_types";

export const useScoresStore = defineStore("scores",
  () => {
    const state = useLocalStorage('scores', [])
    const gameType = useLocalStorage('game', gameTypes[0])

    function add(value) {
      state.value.push(value);
    }

    function setGameType(value) {
      gameType.value = value;
    }

    function clear() {
      state.value = [];
    }

    function undo() {
      state.value.pop();
    }

    return {
      scores: state,
      gameType,
      setGameType,
      add,
      clear,
      undo,
    };
  })
