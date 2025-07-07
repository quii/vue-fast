<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import LeaderboardDisplay from '@/components/leaderboard/LeaderboardDisplay.vue'
import NotificationModal from '@/components/modals/NotificationModal.vue'
import AlertsIcon from '@/components/icons/AlertsIcon.vue'
import { useShootStore } from '@/stores/shoot'
import { useRoute } from 'vue-router'

const shootStore = useShootStore()
const route = useRoute()

// Local state
const showNotificationModal = ref(false)
const groupByRound = ref(true)
const isLoading = ref(true)
const joinCode = ref('')

// Computed
const currentShoot = computed(() => shootStore.currentShoot)
const hasValidShoot = computed(() => currentShoot.value && currentShoot.value.participants)

// Top bar configuration - show shoot code and basic controls
const infoDisplays = computed(() => {
  if (hasValidShoot.value) {
    return [
      {
        value: `#${currentShoot.value.code}`,
        label: 'Shoot Code',
        class: 'wide'
      }
    ]
  }
  return []
})

const actionButtons = computed(() => {
  const buttons = []

  if (hasValidShoot.value) {
    buttons.push({
      iconComponent: null,
      label: groupByRound.value ? 'Ungroup' : 'Group by Round',
      action: 'toggle-grouping',
      variant: 'outline'
    })

    buttons.push({
      iconComponent: AlertsIcon,
      label: 'Alerts',
      action: 'show-notifications'
    })
  }

  return buttons
})

function handleTopBarAction(actionData) {
  if (actionData.action === 'show-notifications') {
    showNotificationModal.value = true
  } else if (actionData.action === 'toggle-grouping') {
    groupByRound.value = !groupByRound.value
  }
}

function closeNotificationModal() {
  showNotificationModal.value = false
}

async function processJoinCode() {
  const joincode = route.params.joincode || route.query.joincode

  if (joincode) {
    const cleanCode = String(joincode).replace(/\D/g, '').slice(0, 4)

    if (cleanCode.length === 4) {
      joinCode.value = cleanCode
      console.log('Join code detected for viewing:', cleanCode)
      
      try {
        // Connect as viewer only (no participant data needed)
        await shootStore.connectAsViewer(cleanCode)
      } catch (error) {
        console.error('Failed to connect as viewer:', error)
      }
    } else {
      console.warn('Invalid join code in URL:', joincode)
    }
  }
}

onMounted(async () => {
  await shootStore.initializeWebSocket()
  await processJoinCode()
  isLoading.value = false
})

onUnmounted(() => {
  shootStore.cleanup()
})
</script>

<template>
  <div class="viewer-page">
    <BaseTopBar
      v-if="hasValidShoot"
      :info-displays="infoDisplays"
      :action-buttons="actionButtons"
      alignment="right"
      @action="handleTopBarAction"
    />

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <p>Loading live scores...</p>
    </div>

    <!-- No shoot found state -->
    <div v-else-if="!hasValidShoot" class="no-shoot-container">
      <div class="no-shoot-content">
        <h2>Shoot Not Found</h2>
        <p v-if="joinCode">
          Could not find an active shoot with code <strong>#{{ joinCode }}</strong>
        </p>
        <p v-else>
          No shoot code provided. Please check your link and try again.
        </p>
      </div>
    </div>

    <!-- Live scores display -->
    <div v-else class="content-container">
      <div class="viewer-header">
        <h2>Live Scores</h2>
        <p class="viewer-description">
          You are viewing this shoot as an observer
        </p>
      </div>
      
      <LeaderboardDisplay
        :shoot="currentShoot"
        :group-by-round="groupByRound"
        viewer-mode
      />
    </div>

    <!-- Notification Modal -->
    <NotificationModal
      v-if="hasValidShoot"
      :visible="showNotificationModal"
      :shoot-code="currentShoot.code"
      :push-notification-manager="shootStore.pushNotificationManager"
      @close="closeNotificationModal"
    />
  </div>
</template>

<style scoped>
.viewer-page {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
}

.content-container {
  flex: 1;
  overflow-y: auto;
  margin-top: 1rem;
}

.loading-container,
.no-shoot-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.no-shoot-content h2 {
  color: var(--color-text);
  margin-bottom: 1rem;
}

.no-shoot-content p {
  color: var(--color-text-mute);
  margin-bottom: 1rem;
}

.viewer-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.viewer-header h2 {
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.viewer-description {
  color: var(--color-text-mute);
  margin: 0;
  font-size: 0.9rem;
}
</style>
