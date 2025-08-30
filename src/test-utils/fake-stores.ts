/**
 * Reusable fake store implementations for testing
 * These provide the same interfaces as real stores but use in-memory data
 */

import { ref, computed, reactive } from 'vue'
import type { Ref } from 'vue'

// Fake Scores Store
export function createFakeScoresStore() {
  const scoresArray: Array<number | string> = reactive([])
  const arrowsArray: Array<any> = reactive([])

  // Create a scores object that behaves like useLocalStorage - has array methods directly available
  const scores = new Proxy(scoresArray, {
    get(target, prop) {
      if (prop === 'value') return target
      return target[prop as any]
    }
  }) as any

  const arrows = new Proxy(arrowsArray, {
    get(target, prop) {
      if (prop === 'value') return target
      return target[prop as any]
    }
  }) as any

  return {
    scores,
    arrows,
    
    add(score: number | string) {
      scoresArray.push(score)
    },
    
    addArrow(arrow: any) {
      arrowsArray.push(arrow)
    },
    
    clear() {
      scoresArray.length = 0
      arrowsArray.length = 0
    },
    
    undo() {
      if (scoresArray.length > 0) {
        scoresArray.pop()
      }
      if (arrowsArray.length > 0) {
        arrowsArray.pop()
      }
    }
  }
}

// Fake Game Type Store
export function createFakeGameTypeStore() {
  let currentType = 'Windsor'
  
  // Create a mock round object that matches the Round class interface
  const createMockRound = () => ({
    name: currentType,
    endSize: 6,
    maxArrows: 108,
    canSaveAnytime: false,
    isImperial: currentType.includes('Windsor') || currentType.includes('York'),
    unit: currentType.includes('Windsor') ? 'yards' : 'meters',
    maxDistanceYards: 60,
    otherDistancesYards: [50, 40],
    maxDistanceMetres: 70,
    otherDistancesMetres: [50, 30],
    getScores: (bowType?: string) => [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M', 'X'],
    prettyRoundName: () => currentType
  })
  
  // For testing, we'll use a simple reactive approach
  const store = reactive({
    type: currentType,
    currentRound: createMockRound(),
    
    setGameType(newType: string) {
      currentType = newType
      store.type = newType
      store.currentRound = createMockRound()
    }
  })

  return store
}

// Fake User Store
export function createFakeUserStore() {
  const user = reactive({
    name: 'Test Archer',
    gender: 'male',
    ageGroup: 'senior',
    bowType: 'recurve',
    constructiveCriticism: false,
    knockColor: '#FF69B4',
    classification: 'Unclassified'
  })

  return {
    user: computed(() => user),
    isExperimentalUser: () => false
  }
}

// Fake History Store
export function createFakeHistoryStore() {
  const history: Ref<any[]> = ref([])

  return {
    history: computed(() => history.value),
    
    add(date: string, score: number, gameType: string, scores: any[], unit: string, userProfile: any, status: string, duration?: number) {
      const id = Date.now()
      const shoot = {
        id,
        date,
        totalScore: score,
        gameType,
        scores,
        unit,
        userProfile,
        shootStatus: status,
        shootDuration: duration
      }
      history.value.push(shoot)
      return id
    },
    
    getById(id: number) {
      return history.value.find(shoot => shoot.id === id)
    },
    
    personalBest(gameType: string) {
      const gameShots = history.value.filter(shoot => shoot.gameType === gameType)
      if (gameShots.length === 0) return 0
      return Math.max(...gameShots.map(shoot => shoot.totalScore))
    },
    
    clear() {
      history.value = []
    }
  }
}

// Fake Notes Store
export function createFakeNotesStore() {
  const pendingNotes: Ref<any[]> = ref([])

  return {
    pendingNotes: computed(() => pendingNotes.value),
    
    addPendingNote(endNumber: number, text: string) {
      pendingNotes.value.push({ endNumber, text, id: Date.now() })
    },
    
    assignPendingNotesToShoot(shootId: number) {
      // In a real implementation, this would move pending notes to permanent storage
      pendingNotes.value = []
    },
    
    clear() {
      pendingNotes.value = []
    }
  }
}

// Fake Arrow History Store
export function createFakeArrowHistoryStore() {
  const arrows: Ref<Record<string, any[]>> = ref({})

  return {
    saveArrowsForShoot(shootId: number, arrowData: any[]) {
      arrows.value[shootId.toString()] = [...arrowData]
    },
    
    getArrowsForShoot(shootId: string | number) {
      return arrows.value[shootId.toString()] || []
    },
    
    clear() {
      arrows.value = {}
    }
  }
}

// Fake Preferences Store
export function createFakePreferencesStore() {
  const preferences = reactive({
    hasSeenScoreCardTutorial: true,
    hasSeenPrintTip: true,
    hasSeenHistoryTip: true,
    hasSeenRoundSelectionTip: true
  })

  return {
    hasSeenScoreCardTutorial: computed(() => preferences.hasSeenScoreCardTutorial),
    hasSeenPrintTip: computed(() => preferences.hasSeenPrintTip),
    hasSeenHistoryTip: computed(() => preferences.hasSeenHistoryTip),
    hasSeenRoundSelectionTip: computed(() => preferences.hasSeenRoundSelectionTip),
    
    dismissPrintTip() {
      preferences.hasSeenPrintTip = true
    }
  }
}

// Fake Shoot Store
export function createFakeShootStore() {
  const isInShoot = ref(false)

  return {
    isInShoot: computed(() => isInShoot.value),
    
    async tryRestoreFromPersistedState() {
      return false
    },
    
    cleanup() {
      // No-op for testing
    },
    
    async updateScore() {
      // No-op for testing
    },
    
    async finishShoot() {
      isInShoot.value = false
    }
  }
}

// Fake Shoot Timing Store
export function createFakeShootTimingStore() {
  const startTime = ref<Date | null>(null)
  const endTime = ref<Date | null>(null)

  return {
    hasStarted() {
      return startTime.value !== null
    },
    
    recordFirstArrow() {
      if (!startTime.value) {
        startTime.value = new Date()
      }
    },
    
    recordLastArrow() {
      endTime.value = new Date()
    },
    
    getShootDuration() {
      if (startTime.value && endTime.value) {
        return Math.round((endTime.value.getTime() - startTime.value.getTime()) / 1000)
      }
      return undefined
    },
    
    clearTiming() {
      startTime.value = null
      endTime.value = null
    }
  }
}

// Fake Achievement Store
export function createFakeAchievementStore() {
  return {
    getAllAchievements() {
      return []
    }
  }
}