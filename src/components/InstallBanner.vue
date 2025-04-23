<script setup>
import { onMounted, ref, watch } from 'vue'
import { useInstallationStore } from '@/stores/installation'
import CloseIcon from '@/components/icons/CloseIcon.vue'

const installationStore = useInstallationStore()
const showInstructions = ref(false)
const isVisible = ref(false)

onMounted(() => {
  installationStore.detectPlatform()
  console.log('InstallBanner mounted, canPromptInstall:', installationStore.canPromptInstall)
  updateVisibility()
})

// Watch for changes in the canPromptInstall computed property
watch(() => installationStore.canPromptInstall, updateVisibility)
watch(() => installationStore.isTestMode, updateVisibility)

function updateVisibility() {
  console.log('Updating visibility, canPromptInstall:', installationStore.canPromptInstall)
  isVisible.value = installationStore.canPromptInstall
}

function promptInstall() {
  console.log('Prompt install clicked, deferredPrompt:', installationStore.deferredPrompt)
  if (installationStore.deferredPrompt) {
    // Show the install prompt for Android
    installationStore.deferredPrompt.prompt()
    installationStore.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      // Reset the deferred prompt variable
      installationStore.setDeferredPrompt(null)
    })
  } else {
    // For iOS or when the native prompt isn't available
    showInstructions.value = true
    console.log('Showing instructions')
  }
}

function dismissBanner() {
  console.log('Dismissing banner')
  installationStore.dismissPrompt()
  showInstructions.value = false
  isVisible.value = false
}
</script>

<template>
  <div v-if="isVisible" class="install-banner">
    <div v-if="!showInstructions" class="banner-content">
      <div class="banner-text">
        <strong>Install Fast</strong>
        <span>Add to your home screen for the best experience</span>
      </div>
      <div class="banner-actions">
        <button class="install-button" @click="promptInstall">Install</button>
        <button class="dismiss-button" @click="dismissBanner">
          <CloseIcon class="close-icon" />
        </button>
      </div>
    </div>

    <div v-else class="install-instructions">
      <div class="instructions-header">
        <h3>How to install Fast</h3>
        <button class="dismiss-button" @click="dismissBanner">
          <CloseIcon class="close-icon" />
        </button>
      </div>

      <div v-if="installationStore.isIOS" class="platform-instructions">
        <h4>On iOS:</h4>
        <ol>
          <li>
            <div class="instruction-step">
              <span>Tap the Share button</span>
              <div class="ios-share-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                  <path d="M4 12V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V12" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </li>
          <li>
            <div class="instruction-step">
              <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              <div class="ios-add-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
            </div>
          </li>
          <li>
            <div class="instruction-step">
              <span>Tap <strong>"Add"</strong> in the top right corner</span>
            </div>
          </li>
        </ol>
      </div>
      <div v-else class="platform-instructions">
        <h4>On Android:</h4>
        <ol>
          <li>
            <div class="instruction-step">
              <span>Tap the menu button</span>
              <div class="android-menu-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </div>
          </li>
          <li>
            <div class="instruction-step">
              <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
              <div class="android-install-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V16M12 16L8 12M12 16L16 12" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M5 20H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
            </div>
          </li>
          <li>
            <div class="instruction-step">
              <span>Follow the on-screen instructions</span>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 3.75rem; /* Position above the navigation bar (60px → 3.75rem) */
  left: 0;
  right: 0;
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -0.125rem 0.625rem rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 0.75rem 1rem 1rem; /* Increased bottom padding (12px/16px → 0.75rem/1rem) */
  animation: slide-up 0.3s ease;
  margin-bottom: 0.5rem; /* Add margin between banner and nav bar (8px → 0.5rem) */
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-text {
  display: flex;
  flex-direction: column;
}

.banner-text strong {
  font-size: 1rem;
  margin-bottom: 4px;
  color: var(--color-text);
}

.banner-text span {
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.install-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
}

.dismiss-button {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.close-icon {
  width: 16px;
  height: 16px;
}

.install-instructions {
  padding: 0.5rem 0 0.75rem; /* Increased bottom padding for instructions (8px/12px → 0.5rem/0.75rem) */
}

.instructions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.instructions-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.platform-instructions h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: var(--color-text);
}

.platform-instructions ol {
  margin: 0;
  padding-left: 24px;
}

.platform-instructions li {
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: var(--color-text);
}

.platform-instructions li:last-child {
  margin-bottom: 0.5rem; /* 8px → 0.5rem */
}

.instruction-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* iOS Icons */
.ios-share-icon,
.ios-add-icon,
.android-menu-icon,
.android-install-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  padding: 4px;
  flex-shrink: 0;
}

.ios-share-icon svg,
.ios-add-icon svg,
.android-menu-icon svg,
.android-install-icon svg {
  width: 100%;
  height: 100%;
  color: var(--color-highlight, #4CAF50);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>