<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import ConnectionStatusIndicator from '@/components/ui/ConnectionStatusIndicator.vue'
import LeaderboardDisplay from '@/components/leaderboard/LeaderboardDisplay.vue'
import JoinShootForm from '@/components/leaderboard/JoinShootForm.vue'
import CreateShootForm from '@/components/leaderboard/CreateShootForm.vue'
import NotificationModal from '@/components/modals/NotificationModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LiveIcon from '@/components/icons/LiveIcon.vue'
import LeaveIcon from '@/components/icons/LeaveIcon.vue'
import AlertsIcon from '@/components/icons/AlertsIcon.vue'
import { useShootStore } from '@/stores/shoot'
import { useUserStore } from '@/stores/user'
import { useGameTypeStore } from '@/stores/game_type'
import { useScoresStore } from '@/stores/scores'
import { calculateTotal } from '@/domain/scoring/subtotals.js'
import { convertToValues } from '@/domain/scoring/scores.js'
import UserProfileForm from '@/components/forms/UserProfileForm.vue'
import { useRoute } from 'vue-router'
import ShareIcon from '@/components/icons/ShareIcon.vue'
import ShareShootModal from '@/components/modals/ShareShootModal.vue'

const shootStore = useShootStore()
const userStore = useUserStore()
const gameTypeStore = useGameTypeStore()
const scoresStore = useScoresStore()

// Local state
const showJoinForm = ref(false)
const showNamePrompt = ref(false)
const showNotificationModal = ref(false)
const pendingAction = ref(null) // 'create' or 'join'
const userName = ref('')
const nameError = ref('')
const joinCodeRaw = ref('')
const showShareModal = ref(false)
const route = useRoute()
// Add this with the other local state
const urlJoinCode = ref('') // Store the join code from URL
const isAutoJoining = ref(false) // Track auto-join state
const groupByRound = ref(true)


computed({
  get() {
    return joinCodeRaw.value
  },
  set(value) {
    // Only allow digits and limit to 4 characters
    const digits = value.replace(/\D/g, '').slice(0, 4)
    joinCodeRaw.value = digits
  }
})
// Computed
const isInShoot = computed(() => shootStore.isInShoot)
const currentShoot = computed(() => shootStore.currentShoot)
const isLoading = computed(() => shootStore.isLoading || isAutoJoining.value)
const currentScore = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)))
const arrowsShot = computed(() => scoresStore.scores.length)
const hasUserName = computed(() => userStore.user.name && userStore.user.name.trim().length > 0)

const activeView = computed(() => {
  if (isInShoot.value) {
    return 'leaderboard'
  }
  if (showNamePrompt.value || !hasUserName.value) {
    return 'name-prompt'
  }
  // Always return 'menu' - the JoinShootForm is embedded there
  return 'menu'
})


// Top bar configuration
const infoDisplays = computed(() => {
  if (activeView.value === 'leaderboard' && currentShoot.value) {
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

  if (activeView.value === 'leaderboard') {
    buttons.push({
      iconComponent: null, // We'll use text for this button
      label: groupByRound.value ? 'Ungroup' : 'Group by Round',
      action: 'toggle-grouping',
      variant: 'outline'
    })

    // Add share button
    buttons.push({
      iconComponent: ShareIcon,
      label: 'Share',
      action: 'share-shoot'
    })

    // Always add alerts button when in leaderboard
    buttons.push({
      iconComponent: AlertsIcon,
      label: 'Alerts',
      action: 'show-notifications'
    })

    buttons.push({
      iconComponent: LeaveIcon,
      label: 'Leave',
      action: 'leave-shoot',
      variant: 'danger'
    })
  }

  return buttons
})

function handleTopBarAction(actionData) {
  if (actionData.action === 'leave-shoot') {
    handleLeaveShoot()
  } else if (actionData.action === 'show-notifications') {
    showNotificationModal.value = true
  } else if (actionData.action === 'share-shoot') {
    showShareModal.value = true
  } else if (actionData.action === 'toggle-grouping') {
    groupByRound.value = !groupByRound.value
  }
}

// Add function to close share modal
function closeShareModal() {
  showShareModal.value = false
}

async function handleShootCreated(code) {
  // The shoot has been created successfully, store will be updated automatically
  console.log('Shoot created with code:', code)
}

function backToMenu() {
  showJoinForm.value = false
  showNamePrompt.value = false
  pendingAction.value = null
  userName.value = ''
  nameError.value = ''
  urlJoinCode.value = '' // Clear URL join code when going back
}

function handleProfileSubmit(profileData) {
  // Update the user store with all the profile data
  userStore.save(
    profileData.ageGroup,
    profileData.gender,
    profileData.bowType,
    profileData.indoorClassifications,
    profileData.outdoorClassifications,
    userStore.user.indoorSeasonStartDate || new Date().toISOString().split('T')[0],
    userStore.user.outdoorSeasonStartDate || new Date().toISOString().split('T')[0],
    profileData.name,
    userStore.user.constructiveCriticism,
    userStore.user.experimentalTargetFace,
    userStore.user.knockColor
  )

  // Execute the pending action or go to menu
  if (pendingAction.value === 'create') {
    showNamePrompt.value = false
    pendingAction.value = null
    createShoot()
  } else if (pendingAction.value === 'join') {
    showNamePrompt.value = false
    pendingAction.value = null
    // Auto-join if we have a URL join code
    if (urlJoinCode.value) {
      handleJoinShoot(urlJoinCode.value)
    } else {
      showJoinForm.value = true
    }
  } else {
    showNamePrompt.value = false
  }
}

async function handleJoinShoot(code) {
  try {
    const success = await shootStore.joinShoot(
      code,
      userStore.user.name,
      gameTypeStore.type,
      currentScore.value,
      arrowsShot.value
    )
    if (success) {
      showJoinForm.value = false
      urlJoinCode.value = '' // Clear URL join code on successful join
      isAutoJoining.value = false
    }
  } catch (error) {
    console.error('Failed to join shoot:', error)
    isAutoJoining.value = false
  }
}

async function handleLeaveShoot() {
  if (!userStore.user.name) return

  try {
    await shootStore.leaveShoot(userStore.user.name)
  } catch (error) {
    console.error('Failed to leave shoot:', error)
  }
}
function closeNotificationModal() {
  showNotificationModal.value = false
}

async function processUrlJoinCode() {
  const joincode = route.query.joincode

  if (joincode) {
    // Validate the join code format (should be 4 digits)
    const cleanCode = String(joincode).replace(/\D/g, '').slice(0, 4)

    if (cleanCode.length === 4) {
      urlJoinCode.value = cleanCode
      console.log('Join code detected from URL:', cleanCode)

      // If user has a name, join immediately
      if (hasUserName.value) {
        isAutoJoining.value = true
        await handleJoinShoot(cleanCode)
      } else {
        // If user doesn't have a name, we'll need to get it first
        pendingAction.value = 'join'
        showNamePrompt.value = true
      }
    } else {
      console.warn('Invalid join code in URL:', joincode)
    }
  }
}

onMounted(async () => {
  // Check if we have a URL join code or might restore a persisted shoot
  const joincode = route.query.joincode
  const hasJoinCode = joincode && String(joincode).replace(/\D/g, '').slice(0, 4).length === 4
  
  // Try to restore persisted state first - this will initialize WebSocket if needed
  const restored = await shootStore.tryRestoreFromPersistedState()
  
  // Only initialize WebSocket if we have a join code and didn't restore a shoot
  if (hasJoinCode && !restored) {
    await shootStore.initializeWebSocket()
  }

  // Process URL join code after stores are initialized
  await processUrlJoinCode()

  // If user doesn't have a name and no URL join code, show the prompt immediately
  if (!hasUserName.value && !urlJoinCode.value) {
    showNamePrompt.value = true
    userName.value = ''
  }
})

onUnmounted(() => {
  shootStore.cleanup()
})
</script>

<template>
  <div class="page">
    <ShareShootModal
      :visible="showShareModal"
      :shoot-code="currentShoot?.code || ''"
      :shoot-title="currentShoot?.title || ''"
      :current-shoot="currentShoot"
      @close="closeShareModal"
    />

    <BaseTopBar
      v-if="activeView === 'leaderboard'"
      :info-displays="infoDisplays"
      :action-buttons="actionButtons"
      alignment="right"
      @action="handleTopBarAction"
    />

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <p>{{ isAutoJoining ? 'Joining shoot...' : 'Loading...' }}</p>
    </div>

    <!-- Name prompt -->
    <div v-else-if="activeView === 'name-prompt'" class="content-container">
      <div class="profile-form-container">
        <UserProfileForm
          title="Welcome to Live Leaderboards!"
          :description="profileDescription"
          :show-name="true"
          name-label="Your Display Name"
          name-placeholder="Enter your full name (e.g. John Smith)"
          :show-classifications="false"
          submit-text="Continue"
          :show-cancel="!!pendingAction"
          cancel-text="Cancel"
          :initial-name="userStore.user.name || ''"
          :initial-age-group="userStore.user.ageGroup || ''"
          :initial-gender="userStore.user.gender || ''"
          :initial-bow-type="userStore.user.bowType || ''"
          @submit="handleProfileSubmit"
          @cancel="backToMenu"
        />
      </div>
    </div>

    <!-- Main menu -->
    <div v-else-if="activeView === 'menu'" class="content-container">
      <div class="menu-container">
        <div class="menu-header">
          <LiveIcon class="menu-icon" />
          <h2>Live Leaderboards</h2>
          <p class="welcome-text">Welcome, {{ userStore.user.name }}!</p>
        </div>

        <!-- Join Shoot Section -->
        <div class="join-section">
          <JoinShootForm
            :user-name="userStore.user.name"
            :round-type="gameTypeStore.type"
            @shoot-joined="handleJoinShoot"
            :initial-join-code="urlJoinCode"
            @cancel="() => {}"
          />
        </div>

        <!-- Divider -->
        <div class="section-divider">
          <span>or</span>
        </div>

        <!-- Create Shoot Section -->
        <div class="create-section">
          <CreateShootForm
            :user-name="userStore.user.name"
            :round-type="gameTypeStore.type"
            @shoot-created="handleShootCreated"
          />
        </div>
      </div>
    </div>

    <!-- Leaderboard display -->
    <div v-else-if="activeView === 'leaderboard'" class="content-container">
      <!-- Shoot Title (if present) -->
      <div v-if="currentShoot?.title" class="shoot-title-header">
        <h1 class="shoot-title">{{ currentShoot.title }}</h1>
      </div>
      
      <!-- Connection Status Indicator -->
      <ConnectionStatusIndicator
        :connection-status="shootStore.connectionStatus"
        :is-in-shoot="shootStore.isInShoot"
        :last-update-time="shootStore.lastUpdateTime"
      />
      
      <LeaderboardDisplay
        :shoot="currentShoot"
        :group-by-round="groupByRound"
        @leave="handleLeaveShoot"
        @join="handleJoinShoot"
      />
    </div>

    <!-- Notification Modal -->
    <NotificationModal
      :visible="showNotificationModal"
      :shoot-code="currentShoot?.code || ''"
      :push-notification-manager="shootStore.pushNotificationManager"
      @close="closeNotificationModal"
    />
  </div>
</template>
<style scoped>
.page {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

.content-container {
  flex: 1;
  overflow-y: auto;
}

.loading-container {
  text-align: center;
  padding: 2rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-container {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.menu-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.menu-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: var(--color-highlight);
}

.menu-header h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 600;
}

.menu-description {
  margin-bottom: 2rem;
  color: var(--color-text-mute);
  line-height: 1.4;
}

.name-prompt-container {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.prompt-title {
  margin: 0 0 0.5rem 0;
  color: var(--color-highlight);
  font-size: 1.1rem;
  font-weight: 600;
}

.prompt-description {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-mute);
  font-size: 0.9rem;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.join-section, .create-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.section-description {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--color-text-mute);
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
  color: var(--color-text-mute);
  font-size: 0.9rem;
}

.section-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border);
  z-index: 1;
}

.section-divider span {
  background-color: var(--color-background);
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.shoot-title-header {
  text-align: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
  background-color: var(--color-background-soft);
}

.shoot-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
  word-wrap: break-word;
  max-width: 100%;
}

:deep(.code-input) {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  max-width: 120px;
  margin: 0 auto;
}
</style>