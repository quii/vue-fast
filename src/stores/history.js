import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'
import { userDataFixer } from "@/domain/user_data_fixer";

export const useHistoryStore = defineStore('history', () => {
  const state = useLocalStorage('history', [])
  const selectedShoot = ref(state.value[0])

  state.value = userDataFixer(state.value);

  function add(date, score, gameType, scores, unit) {
    let maxId = state.value.map(x => x.id).sort((a, b) => a.score - b.score).slice(-1)[0];
    if (!maxId) {
      maxId = 0;
    }
    const nextId = parseInt(maxId, 10) + 1;
    state.value.push({
      id: nextId,
      date,
      score,
      gameType,
      scores,
      unit
    })
  }

  function remove(id) {
    state.value = state.value.filter((item) => item.id !== id);
  }

  function importHistory(history) {
    state.value = userDataFixer(history);
  }

  function setShootToView(id) {
    id = parseInt(id);
    return (selectedShoot.value = state.value.find((shoot) => shoot.id == id));
  }

  return {
    history: state,
    add,
    remove,
    importHistory,
    setShootToView,
    selectedShoot
  };
})
