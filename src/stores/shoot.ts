import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { Shoot } from '../../shared/models/Shoot.js'
import { ShootService } from '../../shared/ports/ShootService.js'
import { HttpShootService } from '@/services/HttpShootService'
import { WebSocketNotificationService } from '@/services/WebSocketNotificationService'
import { PushNotificationManager } from '@/services/PushNotificationManager'
import { useToast } from 'vue-toastification'

interface PersistedShootState {
  shootCode: string
  archerName: string
  roundName: string
  joinedAt: number // timestamp
}

export const useShootStore = defineStore('shoot', () => {
  // State
  const currentShoot = ref<Shoot | null>(null)
  const isLoading = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  // Services
  let shootService: ShootService | null = null
  let webSocketService: WebSocketNotificationService | null = null
  let pushNotificationManager: PushNotificationManager | null = null
  const toast = useToast()

  // Computed
  const isInShoot = computed(() => currentShoot.value !== null)
  const shootCode = computed(() => currentShoot.value?.code || '')

  // LocalStorage helpers
  function saveShootState(shootCode: string, archerName: string, roundName: string) {
    const state: PersistedShootState = {
      shootCode,
      archerName,
      roundName,
      joinedAt: Date.now()
    }
    localStorage.setItem('currentShoot', JSON.stringify(state))
  }

  function getPersistedShootState(): PersistedShootState | null {
    try {
      const stored = localStorage.getItem('currentShoot')
      if (!stored) return null

      const state = JSON.parse(stored) as PersistedShootState

      // Check if the state is too old (e.g., older than 24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      if (Date.now() - state.joinedAt > maxAge) {
        clearPersistedShootState()
        return null
      }

      return state
    } catch (error) {
      console.error('Error parsing persisted shoot state:', error)
      clearPersistedShootState()
      return null
    }
  }

  function clearPersistedShootState() {
    localStorage.removeItem('currentShoot')
  }

  // Initialize services
  async function initializeServices() {
    if (!shootService) {
      shootService = new HttpShootService()
    }

    if (!webSocketService) {
      webSocketService = new WebSocketNotificationService()
      setupWebSocketListeners()
    }
  }

  // Initialize push notifications
  function initializePushNotifications() {
    if (!pushNotificationManager) {
      pushNotificationManager = new PushNotificationManager()
    }
  }

  // Set up WebSocket event listeners
  function setupWebSocketListeners() {
    if (!webSocketService) return

    // Listen for connection events
    webSocketService.addEventListener('websocket-connected', () => {
      connectionStatus.value = 'connected'

      // Subscribe to current shoot if we're in one
      if (currentShoot.value) {
        webSocketService!.subscribeToShoot(currentShoot.value.code)
      }
    })

    webSocketService.addEventListener('websocket-disconnected', () => {
      connectionStatus.value = 'disconnected'
    })

    webSocketService.addEventListener('websocket-error', () => {
      connectionStatus.value = 'error'
    })

    webSocketService.addEventListener('websocket-reconnecting', (event: any) => {
      connectionStatus.value = 'connecting'
    })

    // Listen for shoot updates
    webSocketService.addEventListener('shoot-updated', (event: any) => {
      const { shootCode: updatedShootCode, shoot } = event.detail
      if (currentShoot.value?.code === updatedShootCode) {
        currentShoot.value = shoot
      }
    })

    // Listen for notifications
    webSocketService.addEventListener('shoot-notification', (event: any) => {
      const { shootCode: notificationShootCode, notification } = event.detail

      // Only show notifications for the current shoot
      if (currentShoot.value?.code === notificationShootCode) {
        handleShootNotification(notification)
      }
    })
  }

  // Handle different types of notifications
  function handleShootNotification(notification: any) {
    // Update the current shoot if the notification includes shoot data
    if (notification.shoot && currentShoot.value?.code === notification.shoot.code) {
      currentShoot.value = notification.shoot

      // Process for push notifications
      if (pushNotificationManager && notification.type === 'score_update') {
        pushNotificationManager.processShootUpdate(
          notification.shoot.code,
          notification.shoot.participants,
          notification.archerName
        )
      }
    }

    // Minimal toast notifications - only for major events
    switch (notification.type) {
      case 'joined_shoot':
        break
      case 'left_shoot':
        break
      case 'position_change':
      case 'score_update':
        break
      case 'archer_finished':
        // Could show a toast when someone finishes
        // toast.info(`${notification.archerName} has finished their round!`)
        break
      default:
        console.log('Unknown notification type:', notification.type)
    }
  }

  // Try to restore from persisted state
  async function tryRestoreFromPersistedState(): Promise<boolean> {
    const persistedState = getPersistedShootState()
    if (!persistedState) return false

    await initializeServices()
    if (!shootService) return false

    try {
      // Try to get the shoot to see if it still exists
      const shoot = await shootService.getShoot(persistedState.shootCode)
      if (!shoot) {
        // Shoot no longer exists, clear persisted state
        clearPersistedShootState()
        return false
      }

      // Check if we're still a participant
      const isStillParticipant = shoot.participants.some(
        p => p.archerName === persistedState.archerName
      )

      if (!isStillParticipant) {
        // We're no longer in the shoot, clear persisted state
        clearPersistedShootState()
        return false
      }

      // Restore the shoot state
      currentShoot.value = shoot

      // Connect WebSocket and subscribe
      await initializeWebSocket()
      if (webSocketService && webSocketService.isConnected()) {
        webSocketService.subscribeToShoot(persistedState.shootCode)
      }

      return true
    } catch (error) {
      console.error('Failed to restore shoot state:', error)
      // If we get a 404 or other error, clear the persisted state
      clearPersistedShootState()
      return false
    }
  }

  // Initialize WebSocket connection
  async function initializeWebSocket() {
    await initializeServices()
    initializePushNotifications()

    if (!webSocketService) {
      return
    }

    if (webSocketService.isConnected()) {
      connectionStatus.value = 'connected'
      return
    }

    try {
      connectionStatus.value = 'connecting'
      await webSocketService.connect()
      // connectionStatus will be updated by the event listener
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error)
      connectionStatus.value = 'error'
      toast.error('Failed to connect to real-time updates')
    }
  }

  // Create a new shoot and automatically join it
  async function createShoot(creatorName: string, roundName: string, currentScore: number = 0, arrowsShot: number = 0): Promise<void> {
    console.log('🎯 createShoot called with:', { creatorName, roundName, currentScore, arrowsShot })
    await initializeServices()
    if (!shootService) throw new Error('Shoot service not available')

    try {
      isLoading.value = true
      const result = await shootService.createShoot(creatorName)

      // Connect WebSocket first
      await initializeWebSocket()
      if (webSocketService && webSocketService.isConnected()) {
        webSocketService.subscribeToShoot(result.code)
      }

      // Now join the shoot as a participant
      const joinResult = await shootService.joinShoot(result.code, creatorName, roundName)

      if (joinResult.success && joinResult.shoot) {
        currentShoot.value = joinResult.shoot

        // Save to localStorage
        saveShootState(result.code, creatorName, roundName)

        // Always update score/arrows to sync current state, even if both are 0
        const scoreResult = await shootService.updateScore(result.code, creatorName, currentScore, roundName, arrowsShot)
        if (scoreResult.success && scoreResult.shoot) {
          // Immediately update the local state with the score update
          currentShoot.value = scoreResult.shoot
        }

      } else {
        // Fallback to the original shoot if join fails
        currentShoot.value = result.shoot
      }
    } catch (error) {
      console.error('Failed to create shoot:', error)
      toast.error('Failed to create shoot')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Add this method to try joining via WebSocket first
  async function joinShootViaWebSocket(code: string, archerName: string, roundName: string): Promise<{ success: boolean; shoot?: any }> {
    if (!webSocketService || !webSocketService.isConnected()) {
      console.log('WebSocket not connected, falling back to HTTP for join')
      return { success: false }
    }

    try {
      console.log('Joining shoot via WebSocket')
      return await webSocketService.joinShoot(code, archerName, roundName)
    } catch (error) {
      console.error('Failed to join shoot via WebSocket:', error)
      return { success: false }
    }
  }

  // Join an existing shoot
  async function joinShoot(code: string, archerName: string, roundName: string, currentScore: number = 0, arrowsShot: number = 0): Promise<boolean> {
    await initializeServices()
    if (!shootService) throw new Error('Shoot service not available')

    try {
      isLoading.value = true

      // Try WebSocket first
      const wsResult = await joinShootViaWebSocket(code, archerName, roundName)

      if (wsResult.success && wsResult.shoot) {
        currentShoot.value = wsResult.shoot

        // Save to localStorage
        saveShootState(code, archerName, roundName)

        // Connect WebSocket and subscribe to the shoot
        await initializeWebSocket()
        if (webSocketService && webSocketService.isConnected()) {
          webSocketService.subscribeToShoot(code)
        }

        // Always update score/arrows to sync current state, even if both are 0
        const scoreResult = await updateScore(archerName, currentScore, roundName, arrowsShot)

        isLoading.value = false
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to join shoot:', error)
      isLoading.value = false
      return false
    }
  }

  // Leave the current shoot
  async function leaveShoot(archerName: string): Promise<void> {
    if (!shootService || !currentShoot.value) return

    try {
      isLoading.value = true
      const result = await shootService.leaveShoot(currentShoot.value.code, archerName)

      if (result.success) {
        // Unsubscribe from WebSocket updates
        if (webSocketService) {
          webSocketService.unsubscribeFromShoot(currentShoot.value.code)
        }

        // Clear persisted state
        clearPersistedShootState()

        currentShoot.value = null
      } else {
        toast.error('Failed to leave shoot')
      }
    } catch (error) {
      console.error('Failed to leave shoot:', error)
      toast.error('Failed to leave shoot')
    } finally {
      isLoading.value = false
    }
  }

  // Update score for current user
  async function updateScoreViaWebSocket(code: string, archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification?: string): Promise<boolean> {
    if (!webSocketService || !webSocketService.isConnected()) {
      console.log('WebSocket not connected, falling back to HTTP')
      return false
    }

    try {
      console.log('Updating score via WebSocket')
      const result = await webSocketService.updateScore(
        code,
        archerName,
        totalScore,
        roundName,
        arrowsShot,
        currentClassification
      )

      if (result.success && result.shoot) {
        // Update the local state with the returned shoot
        currentShoot.value = result.shoot
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to update score via WebSocket:', error)
      return false
    }
  }

  async function updateScore(archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification? :string): Promise<boolean> {
    if (!currentShoot.value) return false

    isLoading.value = true

    try {
      // Try WebSocket first
      const wsSuccess = await updateScoreViaWebSocket(
        currentShoot.value.code,
        archerName,
        totalScore,
        roundName,
        arrowsShot,
        currentClassification
      )

      // If WebSocket succeeded, we're done
      if (wsSuccess) {
        isLoading.value = false
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update score:', error)
      isLoading.value = false
      return false
    }
  }

  // Finish shoot for current user
  async function finishShoot(archerName: string, totalScore: number, roundName: string, arrowsShot: number, currentClassification? :string): Promise<void> {
    if (!shootService || !currentShoot.value) return

    try {
      const result = await shootService.finishShoot(currentShoot.value.code, archerName, totalScore, roundName, arrowsShot, currentClassification)

      if (result.success && result.shoot) {
        // Update local state immediately
        currentShoot.value = result.shoot
        toast.success('Round completed and score locked!')
      } else {
        toast.error('Failed to finish shoot')
      }
    } catch (error) {
      console.error('Failed to finish shoot:', error)
      toast.error('Failed to finish shoot')
    }
  }

  // Cleanup function
  function cleanup() {
    if (webSocketService) {
      webSocketService.disconnect()
    }
    currentShoot.value = null
    connectionStatus.value = 'disconnected'
  }

  return {
    // State
    currentShoot,
    isLoading,
    connectionStatus,

    // Computed
    isInShoot,
    shootCode,

    // Services - expose for components
    pushNotificationManager: computed(() => pushNotificationManager),

    // Actions
    initializeWebSocket,
    tryRestoreFromPersistedState,
    createShoot,
    joinShoot,
    leaveShoot,
    updateScore,
    finishShoot, // New method
    cleanup: () => {
      if (webSocketService) {
        webSocketService.disconnect()
      }
      if (pushNotificationManager && currentShoot.value) {
        pushNotificationManager.clearShootSettings(currentShoot.value.code)
      }
      // Don't clear persisted state on cleanup - only on explicit leave
      currentShoot.value = null
      connectionStatus.value = 'disconnected'
    }
  }
})