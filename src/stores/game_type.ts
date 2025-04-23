import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { gameTypeConfig, gameTypes, roundConfigManager } from '@/domain/scoring/game_types'
import { computed } from "vue";


export const useGameTypeStore = defineStore('gameType', () => {
  const type = useLocalStorage('game', gameTypes[0])

  function setGameType(value) {
    type.value = value
  }

  const currentRound = computed(() => {
    return roundConfigManager.getRound(type.value)
  })

  return {
    type,
    setGameType,
    currentRound
  }
})
