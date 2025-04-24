<script setup>
import { useInstallationStore } from '@/stores/installation'
import { usePreferencesStore } from '@/stores/preferences'
import { ref, computed, watch } from 'vue'

const installationStore = useInstallationStore()
const preferencesStore = usePreferencesStore()
const isDevelopment = computed(() => import.meta.env.MODE === 'development')
const debugInfo = ref('')
const isVisible = computed(() => isDevelopment.value && installationStore.showDevTools)

function toggleTestMode() {
  installationStore.toggleTestMode()
  debugInfo.value = `Test mode: ${installationStore.isTestMode ? 'ON' : 'OFF'}`
  console.log('Toggled test mode:', installationStore.isTestMode)
}

function resetPromptStatus() {
  installationStore.resetPromptStatus()
  debugInfo.value = 'Reset prompt status'
  console.log('Reset prompt status')
}

function simulateInstall() {
  installationStore.simulateInstallPrompt()
  debugInfo.value = 'Simulated install prompt'
  console.log('Simulated install prompt, deferredPrompt:', installationStore.deferredPrompt)
}

function toggleIOSMode() {
  installationStore.isIOS = !installationStore.isIOS
  debugInfo.value = `iOS mode: ${installationStore.isIOS ? 'ON' : 'OFF'}`
  console.log('Toggled iOS mode:', installationStore.isIOS)
}

function resetAllTips() {
  preferencesStore.resetAllTips()
  debugInfo.value = 'Reset all tips and tutorials'
  console.log('Reset all tips and tutorials')
}
</script>

<template>
  <div v-if="isVisible" class="dev-tools">
    <div class="dev-tools-section">
      <h3>Installation</h3>
      <button @click="toggleTestMode">
        {{ installationStore.isTestMode ? 'Hide' : 'Show' }} Install Banner
      </button>
      <button @click="resetPromptStatus">
        Reset "Don't show again" status
      </button>
      <button @click="simulateInstall">
        Simulate Install Prompt
      </button>
      <label>
        <input
          type="checkbox"
          :checked="installationStore.isIOS"
          @change="toggleIOSMode"
        >
        Simulate iOS
      </label>
    </div>

    <div class="dev-tools-section">
      <h3>Tutorials</h3>
      <button @click="resetAllTips">
        Reset All Tips & Tutorials
      </button>
    </div>

    <div v-if="debugInfo" class="debug-info">{{ debugInfo }}</div>
  </div>
</template>

<style scoped>
.dev-tools {
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
  max-width: 200px;
}

.dev-tools-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-tools-section h3 {
  margin: 0;
  font-size: 12px;
  color: #4CAF50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 4px;
}

button {
  padding: 4px 8px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

button:hover {
  background: #3d8b40;
}

label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.debug-info {
  margin-top: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 10px;
}
</style>