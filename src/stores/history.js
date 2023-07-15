import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  const state = useLocalStorage('history', [])
  const selectedShoot = ref(state.value[0])

  function add(date, score, distance, gameType, scores) {
    state.value.push({
      id: state.value.length + 1,
      date,
      score,
      distance,
      gameType,
      scores
    })
  }

  function remove(id) {
    state.value = state.value.filter((item) => item.id !== id)
  }

  function importHistory(history) {
    state.value = history
  }

  function setShootToView(index) {
    return (selectedShoot.value = state.value[index])
  }

  return {
    history: state,
    add,
    remove,
    importHistory,
    setShootToView,
    selectedShoot
  }
})
