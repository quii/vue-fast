import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { Shoot } from '../../shared/models/Shoot.js'
import { ShootService } from '../../shared/ports/ShootService.js'
import { HttpShootService } from '@/services/HttpShootService'
import { WebSocketNotificationService } from '@/services/WebSocketNotificationService'
import { PushNotificationManager } from '@/services/PushNotificationManager'
import { useToast } from 'vue-toastification'

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
      default:
        console.log('Unknown notification type:', notification.type)
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

  // Join an existing shoot
  async function joinShoot(code: string, archerName: string, roundName: string, currentScore: number = 0, arrowsShot: number = 0): Promise<boolean> {
    await initializeServices()
    if (!shootService) throw new Error('Shoot service not available')

    try {
      isLoading.value = true
      const result = await shootService.joinShoot(code, archerName, roundName)

      if (result.success && result.shoot) {
        currentShoot.value = result.shoot

        // Connect WebSocket and subscribe to the shoot
        await initializeWebSocket()
        if (webSocketService && webSocketService.isConnected()) {
          webSocketService.subscribeToShoot(code)
        }

        // Always update score/arrows to sync current state, even if both are 0
        const scoreResult = await shootService.updateScore(code, archerName, currentScore, roundName, arrowsShot)
        if (scoreResult.success && scoreResult.shoot) {
          // Immediately update the local state with the score update
          currentShoot.value = scoreResult.shoot
        }

        return true
      } else {
        toast.error('Failed to join shoot - shoot not found')
        return false
      }
    } catch (error) {
      toast.error('Failed to join shoot')
      return false
    } finally {
      isLoading.value = false
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
  async function updateScore(archerName: string, totalScore: number, roundName: string, arrowsShot: number): Promise<void> {
    if (!shootService || !currentShoot.value) return

    try {
      const result = await shootService.updateScore(currentShoot.value.code, archerName, totalScore, roundName, arrowsShot)

      if (result.success && result.shoot) {
      } else {
        toast.error('Failed to update score')
      }
    } catch (error) {
      console.error('Failed to update score:', error)
      toast.error('Failed to update score')
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
    createShoot,
    joinShoot,
    leaveShoot,
    updateScore,
    cleanup: () => {
      if (webSocketService) {
        webSocketService.disconnect()
      }
      if (pushNotificationManager && currentShoot.value) {
        pushNotificationManager.clearShootSettings(currentShoot.value.code)
      }
      currentShoot.value = null
      connectionStatus.value = 'disconnected'
    }
  }
})