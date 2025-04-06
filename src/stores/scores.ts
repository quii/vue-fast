import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useScoresStore = defineStore('scores', () => {
  const state = useLocalStorage('scores', [])
  const arrows = useLocalStorage("current-arrows", []);

  function add(value) {
    state.value.push(value)
  }

  function addArrow(arrow) {
    arrows.value.push(arrow);
  }

  function clear() {
    state.value = []
    arrows.value = [];
  }

  function undo() {
    state.value.pop()
    arrows.value.pop();
  }

  return {
    scores: state,
    arrows,
    add,
    addArrow,
    clear,
    undo
  }
})
