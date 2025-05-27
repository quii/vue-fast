<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import ButtonGroup from '../ui/ButtonGroup.vue'
import JoinShootForm from '../leaderboard/JoinShootForm.vue'
import LeaderboardDisplay from '../leaderboard/LeaderboardDisplay.vue'
import { useShootStore } from '@/stores/shoot'
import { useUserStore } from '@/stores/user'
import { useGameTypeStore } from '@/stores/game_type'
import { useScoresStore } from '@/stores/scores'
import { calculateTotal } from '@/domain/scoring/subtotals.js'
import { convertToValues } from '@/domain/scoring/scores.js'
import NotificationSettings from '../leaderboard/NotificationSettings.vue'
import CreateShootForm from '@/components/leaderboard/CreateShootForm.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const shootStore = useShootStore()
const userStore = useUserStore()
const gameTypeStore = useGameTypeStore()
const scoresStore = useScoresStore()

const showJoinForm = ref(false)
const showNamePrompt = ref(false)
const isCreatingShoot = ref(false)
const pendingAction = ref(null) // 'create' or 'join'
const pendingJoinCode = ref('')
const userName = ref('')

// Computed
const isInShoot = computed(() => shootStore.isInShoot)
const currentShoot = computed(() => shootStore.currentShoot)
const isLoading = computed(() => shootStore.isLoading || isCreatingShoot.value)
const hasUserName = computed(() => userStore.user.name && userStore.user.name.trim().length > 0)
const currentScore = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)))
const arrowsShot = computed(() => scoresStore.scores.length)

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

// Dynamic title based on context
const modalTitle = computed(() => {
  if (activeView.value === 'leaderboard') {
    return `Live Shoot ${shootStore.shootCode}`
  }
  return 'Live Scores'
})

// Actions
function showJoinShoot() {
  if (!hasUserName.value) {
    pendingAction.value = 'join'
    userName.value = ''
    showNamePrompt.value = true
  } else {
    showJoinForm.value = true
  }
}

function backToMenu() {
  showJoinForm.value = false
  showNamePrompt.value = false
  pendingAction.value = null
  pendingJoinCode.value = ''
  userName.value = ''
}

async function handleCreateShoot() {
  if (!hasUserName.value) {
    pendingAction.value = 'create'
    userName.value = ''
    showNamePrompt.value = true
    return
  }

  try {
    isCreatingShoot.value = true
    await shootStore.createShoot(
      userStore.user.name,
      gameTypeStore.type,
      currentScore.value,
      arrowsShot.value
    )
    // Will automatically transition to leaderboard view since isInShoot becomes true
  } catch (error) {
    console.error('Failed to create shoot:', error)
  } finally {
    isCreatingShoot.value = false
  }
}

function handleNameSubmit() {
  const trimmedName = userName.value.trim()
  if (trimmedName.length === 0) return

  // Update the user store with the new name
  userStore.updateUser({ name: trimmedName })

  // Execute the pending action
  if (pendingAction.value === 'create') {
    showNamePrompt.value = false
    handleCreateShoot()
  } else if (pendingAction.value === 'join') {
    showNamePrompt.value = false
    showJoinForm.value = true
  }

  // Clear pending state
  pendingAction.value = null
  userName.value = ''
}

async function handleJoinShoot(code) {
  try {
    const success = await shootStore.joinShoot(
      code,
      userStore.user.name,
      gameTypeStore.type,
      currentScore.value
    )
    if (success) {
      // Will automatically transition to leaderboard view since isInShoot becomes true
    }
  } catch (error) {
    console.error('Failed to join shoot:', error)
  }
}

async function handleJoinFromLeaderboard(data) {
  // Handle joining from within the leaderboard display
  await handleJoinShoot(data.code)
}

async function handleLeaveShoot() {
  if (!userStore.user.name) return

  try {
    await shootStore.leaveShoot(userStore.user.name)
    // Will automatically go back to menu view
  } catch (error) {
    console.error('Failed to leave shoot:', error)
  }
}

function handleClose() {
  emit('close')
}

function handleNameKeyPress(event) {
  if (event.key === 'Enter' && userName.value.trim().length > 0) {
    handleNameSubmit()
  }
}

onMounted(async () => {
  if (props.visible) {
    await shootStore.initializeWebSocket()
  }
})

// Watch for when the modal becomes visible
watch(() => props.visible, async (isVisible) => {
  if (isVisible) {
    await shootStore.initializeWebSocket()
  }
})

onUnmounted(() => {
  shootStore.cleanup()
})
</script>

<template>
  <BaseModal
    v-if="visible"
    :title="modalTitle"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <p>{{ isCreatingShoot ? 'Creating live shoot...' : 'Loading...' }}</p>
    </div>

    <!-- Name prompt -->
    <div v-else-if="activeView === 'name-prompt'" class="name-prompt-container">
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

    <!-- Main menu - show when not in a shoot -->
    <div v-else-if="activeView === 'menu'" class="menu-container">
      <p class="menu-description">
        Create or join a live leaderboard to compete with other archers in real-time.
      </p>

      <ButtonGroup>
        <BaseButton @click="handleCreateShoot">
          Create Live Shoot
        </BaseButton>
        <BaseButton variant="outline" @click="showJoinShoot">
          Join Live Shoot
        </BaseButton>
      </ButtonGroup>

      <ButtonGroup>
        <BaseButton variant="text" @click="handleClose">
          Cancel
        </BaseButton>
      </ButtonGroup>
    </div>

    <!-- Create shoot form -->
    <div v-else-if="activeView === 'create'" class="create-container">
      <CreateShootForm
        :user-name="userStore.user.name"
        :round-type="gameTypeStore.type"
        @shoot-created="handleCreateShoot"
      />

      <!-- Add notification settings -->
      <NotificationSettings
        v-if="shootStore.shootCode"
        :shoot-code="shootStore.shootCode"
        :push-notification-manager="shootStore.pushNotificationManager"
      />
    </div>

    <!-- Join shoot form -->
    <div v-else-if="activeView === 'join'" class="join-container">
      <JoinShootForm
        :user-name="userStore.user.name"
        @shoot-joined="handleJoinShoot"
        @cancel="backToMenu"
      />

      <!-- Add notification settings after successful join -->
      <NotificationSettings
        v-if="isInShoot"
        :shoot-code="shootStore.shootCode"
        :push-notification-manager="shootStore.pushNotificationManager"
      />
    </div>

    <!-- Leaderboard display -->
    <LeaderboardDisplay
      v-else-if="activeView === 'leaderboard'"
      :shoot="currentShoot"
      :push-notification-manager="shootStore.pushNotificationManager"
      @leave="handleLeaveShoot"
      @join="handleJoinFromLeaderboard"
      @close="handleClose"
    />
  </BaseModal>
</template>

<style scoped>
.loading-container {
  text-align: center;
  padding: 2rem;
}

.menu-container {
  text-align: center;
}

.menu-description {
  margin-bottom: 1.5rem;
  color: var(--color-text-mute, #666);
  line-height: 1.4;
}

.name-prompt-container {
  text-align: center;
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

/* Responsive adjustments */
@media (max-width: 480px) {
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>