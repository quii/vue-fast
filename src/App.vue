<template>
  <div id="app">
    <router-view></router-view>
    <InstallBanner />
  </div>
</template>

<script setup>
import InstallBanner from './components/InstallBanner.vue'
import { onMounted } from 'vue'
import { useInstallationStore } from './stores/installation'

const installationStore = useInstallationStore()

onMounted(() => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Store the event so it can be triggered later
    installationStore.setDeferredPrompt(e)
  })

  // Detect when app is installed
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    installationStore.setDeferredPrompt(null)
    console.log('PWA was installed')
  })

  // Initial platform detection
  installationStore.detectPlatform()
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
