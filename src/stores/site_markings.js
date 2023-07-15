import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSightMarkingsStore = defineStore('sightMarkings', () => {
  const markings = useLocalStorage('sightMarkings', [])

  function add(distance, reading) {
    markings.value.push({ distance, reading, id: markings.length })
  }

  function remove(id) {
    markings.value = markings.value.filter(m => m.id !== id)
  }

  return {
    markings,
    add,
    remove
  }
})
