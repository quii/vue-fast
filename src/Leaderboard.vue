<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import LeaderboardDisplay from '@/components/leaderboard/LeaderboardDisplay.vue'
import JoinShootForm from '@/components/leaderboard/JoinShootForm.vue'
import NotificationModal from '@/components/modals/NotificationModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'
import LiveIcon from '@/components/icons/LiveIcon.vue'
import LeaveIcon from '@/components/icons/LeaveIcon.vue'
import AlertsIcon from '@/components/icons/AlertsIcon.vue'
import { useShootStore } from '@/stores/shoot'
import { useUserStore } from '@/stores/user'
import { useGameTypeStore } from '@/stores/game_type'
import { useScoresStore } from '@/stores/scores'
import { calculateTotal } from '@/domain/scoring/subtotals.js'
import { convertToValues } from '@/domain/scoring/scores.js'

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

// Computed
const isInShoot = computed(() => shootStore.isInShoot)
const currentShoot = computed(() => shootStore.currentShoot)
const isLoading = computed(() => shootStore.isLoading)
const currentScore = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)))
const arrowsShot = computed(() => scoresStore.scores.length)
const hasUserName = computed(() => userStore.user.name && userStore.user.name.trim().length > 0)

// Show appropriate view based on shoot state
const activeView = computed(() => {
  if (isInShoot.value) {
    return 'leaderboard'
  }
  if (showNamePrompt.value) {
    return 'name-prompt'
  }
  if (showJoinForm.value) {
    return 'join'
  }
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

// Methods
function handleTopBarAction(actionData) {
  if (actionData.action === 'leave-shoot') {
    handleLeaveShoot()
  } else if (actionData.action === 'show-notifications') {
    showNotificationModal.value = true
  }
}

function showJoinShoot() {
  if (!hasUserName.value) {
    pendingAction.value = 'join'
    userName.value = ''
    showNamePrompt.value = true
  } else {
    showJoinForm.value = true
  }
}

async function createShoot() {
  if (!hasUserName.value) {
    pendingAction.value = 'create'
    userName.value = ''
    showNamePrompt.value = true
    return
  }

  try {
    await shootStore.createShoot(
      userStore.user.name,
      gameTypeStore.type,
      currentScore.value,
      arrowsShot.value
    )
  } catch (error) {
    console.error('Failed to create shoot:', error)
  }
}

function backToMenu() {
  showJoinForm.value = false
  showNamePrompt.value = false
  pendingAction.value = null
  userName.value = ''
}

function handleNameSubmit() {
  const trimmedName = userName.value.trim()
  if (trimmedName.length === 0) return

  // Update the user store with the new name
  userStore.updateUser({ name: trimmedName })

  // Execute the pending action
  if (pendingAction.value === 'create') {
    showNamePrompt.value = false
    pendingAction.value = null
    userName.value = ''
    // Create shoot immediately after setting name
    createShoot()
  } else if (pendingAction.value === 'join') {
    showNamePrompt.value = false
    pendingAction.value = null
    userName.value = ''
    showJoinForm.value = true
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
    }
  } catch (error) {
    console.error('Failed to join shoot:', error)
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

function handleNameKeyPress(event) {
  if (event.key === 'Enter' && userName.value.trim().length > 0) {
    handleNameSubmit()
  }
}

function closeNotificationModal() {
  showNotificationModal.value = false
}

onMounted(async () => {
  await shootStore.initializeWebSocket()
  await shootStore.tryRestoreFromPersistedState()
})

onUnmounted(() => {
  shootStore.cleanup()
})
</script>

<template>
  <div class="page">
    <BaseTopBar
      v-if="activeView === 'leaderboard'"
      :info-displays="infoDisplays"
      :action-buttons="actionButtons"
      alignment="right"
      @action="handleTopBarAction"
    />

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <p>Loading...</p>
    </div>

    <!-- Name prompt -->
    <div v-else-if="activeView === 'name-prompt'" class="content-container">
      <div class="name-prompt-container">
        <h4 class="prompt-title">Enter Your Name</h4>
        <p class="prompt-description">
          Please enter your name to {{ pendingAction === 'create' ? 'create' : 'join' }} a live shoot.
        </p>

        <div class="form-group">
          <label for="user-name" class="form-label">Your Name</label>
          <input
            id="user-name"
            v-model="userName"
            type="text"
            class="form-input"
            placeholder="Enter your name"
            maxlength="50"
            @keypress="handleNameKeyPress"
            autofocus
          />
        </div>

        <ButtonGroup>
          <BaseButton
            variant="primary"
            :disabled="userName.trim().length === 0"
            @click="handleNameSubmit"
          >
            Continue
          </BaseButton>
          <BaseButton
            variant="text"
            @click="backToMenu"
          >
            Cancel
          </BaseButton>
        </ButtonGroup>
      </div>
    </div>

    <!-- Main menu -->
    <div v-else-if="activeView === 'menu'" class="content-container">
      <div class="menu-container">
        <div class="menu-header">
          <LiveIcon class="menu-icon" />
          <h2>Live Leaderboards</h2>
        </div>

        <p class="menu-description">
          Create or join a live leaderboard to compete with other archers in real-time.
        </p>

        <ButtonGroup>
          <BaseButton @click="createShoot">
            Create Live Shoot
          </BaseButton>
          <BaseButton variant="outline" @click="showJoinShoot">
            Join Live Shoot
          </BaseButton>
        </ButtonGroup>
      </div>
    </div>

    <!-- Join shoot form -->
    <div v-else-if="activeView === 'join'" class="content-container">
      <JoinShootForm
        :user-name="userStore.user.name"
        :round-type="gameTypeStore.type"
        @shoot-joined="handleJoinShoot"
        @cancel="backToMenu"
      />
    </div>

    <!-- Leaderboard display -->
    <div v-else-if="activeView === 'leaderboard'" class="content-container">
      <LeaderboardDisplay
        :shoot="currentShoot"
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
  padding: 1rem 0;
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
  color: var(--color-highlight, #4CAF50);
}

.menu-header h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 600;
}

.menu-description {
  margin-bottom: 2rem;
  color: var(--color-text-mute, #666);
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
  color: var(--color-highlight, #4CAF50);
  font-size: 1.1rem;
  font-weight: 600;
}

.prompt-description {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-mute, #666);
  font-size: 0.9rem;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: 6px;
  font-size: 1rem;
  background-color: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-highlight, #4CAF50);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

@media (max-width: 480px) {
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .menu-container,
  .name-prompt-container {
    padding: 1rem 0.5rem;
  }
}
</style>