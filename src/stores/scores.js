import { defineStore } from 'pinia'
import { useLocalStorage } from "@vueuse/core";

export const useScoresStore = defineStore("scores",
  () => {
    const state = useLocalStorage('scores', [])

    function add(value) {
      state.value.push(value);
    }

    function clear() {
      state.value = [];
    }

    function undo() {
      state.value.pop();
    }

    return {
      scores: state,
      add,
      clear,
      undo,
    };
  })
