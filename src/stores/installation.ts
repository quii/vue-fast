import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInstallationStore = defineStore('installation', () => {
  const deferredPrompt = ref(null)
  const isInstallable = ref(false)
  const isIOS = ref(false)
  const isStandalone = ref(false)
  const hasSeenInstallPrompt = ref(localStorage.getItem('hasSeenInstallPrompt') === 'true')
  const showDevTools = ref(localStorage.getItem('showDevTools') === 'true')

  // For testing purposes
  const isDevelopment = import.meta.env.MODE === 'development'
  const isTestMode = ref(isDevelopment)

  const canPromptInstall = computed(() =>
    isTestMode.value || (!isStandalone.value && !hasSeenInstallPrompt.value)
  )

  function setDeferredPrompt(prompt) {
    console.log('Setting deferred prompt:', prompt)
    deferredPrompt.value = prompt
    isInstallable.value = !!prompt
  }

  function detectPlatform() {
    // Check if the app is running in standalone mode (already installed)
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')

    // Detect iOS - but only if we're not overriding it in test mode
    if (!isTestMode.value) {
      isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    }
  }

  function dismissPrompt() {
    console.log('Dismissing prompt')
    hasSeenInstallPrompt.value = true
    localStorage.setItem('hasSeenInstallPrompt', 'true')

    // If we're in test mode, also disable test mode to ensure the banner stays dismissed
    if (isTestMode.value) {
      isTestMode.value = false
    }
  }

  function resetPromptStatus() {
    console.log('Resetting prompt status')
    hasSeenInstallPrompt.value = false
    localStorage.removeItem('hasSeenInstallPrompt')
  }

  function toggleTestMode() {
    console.log('Toggling test mode from', isTestMode.value, 'to', !isTestMode.value)
    isTestMode.value = !isTestMode.value
  }

  function simulateInstallPrompt() {
    console.log('Simulating install prompt')
    // Create a mock event that mimics beforeinstallprompt
    const mockPrompt = {
      prompt: () => {
        console.log('Mock prompt called')
        return Promise.resolve()
      },
      userChoice: Promise.resolve({ outcome: 'accepted' })
    }

    setDeferredPrompt(mockPrompt)
  }

  function toggleDevTools(value) {
    console.log('Toggling dev tools to:', value)
    showDevTools.value = value
    localStorage.setItem('showDevTools', value ? 'true' : 'false')
  }

  return {
    deferredPrompt,
    isInstallable,
    isIOS,
    isStandalone,
    hasSeenInstallPrompt,
    canPromptInstall,
    setDeferredPrompt,
    detectPlatform,
    dismissPrompt,
    resetPromptStatus,
    isTestMode,
    toggleTestMode,
    simulateInstallPrompt,
    toggleDevTools,
    showDevTools
  }
})