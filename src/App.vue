<template>
  <div id="app" :class="{ 'viewer-mode': isViewerRoute }">
    <router-view></router-view>
    <MainNavigation v-if="!isViewerRoute" />
    <InstallBanner />
  </div>
</template>

<script setup>
import InstallBanner from './components/InstallBanner.vue'
import { onMounted, computed, watchEffect } from 'vue'
import { useInstallationStore } from './stores/installation'
import { useRoute } from 'vue-router'
import MainNavigation from '@/components/UserNavigation.vue'

const installationStore = useInstallationStore()
const route = useRoute()

// Hide navigation for viewer routes
const isViewerRoute = computed(() => {
  return route.path.startsWith('/viewer')
})

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

#app.viewer-mode {
  margin-top: 0;
}
</style>
