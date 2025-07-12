import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useShootTimingStore = defineStore('shoot-timing', () => {
  const startTime = useLocalStorage<number | null>('shoot-start-time', null)
  const endTime = useLocalStorage<number | null>('shoot-end-time', null)

  function recordFirstArrow() {
    if (startTime.value === null) {
      startTime.value = Date.now()
    }
  }

  function recordLastArrow() {
    endTime.value = Date.now()
  }

  function getShootDuration(): number | undefined {
    if (startTime.value && endTime.value) {
      const duration = endTime.value - startTime.value
      return duration > 0 ? duration : undefined
    }
    return undefined
  }

  function clearTiming() {
    startTime.value = null
    endTime.value = null
  }

  function hasStarted(): boolean {
    return startTime.value !== null
  }

  return {
    recordFirstArrow,
    recordLastArrow,
    getShootDuration,
    clearTiming,
    hasStarted,
    startTime,
    endTime
  }
})
