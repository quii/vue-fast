import { defineStore } from 'pinia'
import { useLocalStorage } from "@vueuse/core";
import { gameTypes } from "@/domain/game_types";

export const useGameTypeStore = defineStore("gameType",
  () => {
    const type = useLocalStorage('game', gameTypes[0])

    function setGameType(value) {
      type.value = value;
    }

    return {
      type,
      setGameType,
    };
  })
