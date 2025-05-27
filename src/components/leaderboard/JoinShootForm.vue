<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'
import { useShootStore } from '@/stores/shoot'

const props = defineProps({
  userName: {
    type: String,
    required: true
  },
  roundType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['shoot-joined', 'cancel'])

const shootStore = useShootStore()

// Local state
const shootCode = ref('')
const isJoining = ref(false)

// Computed
const canJoin = computed(() => {
  return shootCode.value.trim().length === 4 &&
         !isJoining.value &&
         !shootStore.isLoading
})

const buttonText = computed(() => {
  if (isJoining.value || shootStore.isLoading) {
    return 'Joining...'
  }
  return 'Join Shoot'
})

const formattedCode = computed({
  get() {
    return shootCode.value
  },
  set(value) {
    // Only allow digits and limit to 4 characters
    const digits = value.replace(/\D/g, '').slice(0, 4)
    shootCode.value = digits
  }
})

// Methods
async function handleJoinShoot() {
  if (!canJoin.value) return

  try {
    isJoining.value = true
    // Just emit the code, let parent handle the actual joining
    emit('shoot-joined', shootCode.value.trim())
  } catch (error) {
    console.error('Failed to join shoot:', error)
  } finally {
    isJoining.value = false
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && canJoin.value) {
    handleJoinShoot()
  }
}
</script>

<template>
  <div class="join-shoot-form">
    <h4 class="form-title">Join Existing Shoot</h4>
    <p class="form-description">
      Enter the 4-digit code to join the shared leaderboard.
    </p>

    <div class="form-group">
      <label for="shoot-code" class="form-label">Shoot Code</label>
      <input
        id="shoot-code"
        v-model="formattedCode"
        type="text"
        class="form-input code-input"
        placeholder="1234"
        maxlength="4"
        inputmode="numeric"
        pattern="[0-9]*"
        :disabled="isJoining || shootStore.isLoading"
        @keypress="handleKeyPress"
      />
      <p class="form-hint">
        4-digit code provided by the shoot creator
      </p>
    </div>

    <ButtonGroup>
      <BaseButton
        variant="primary"
        :disabled="!canJoin"
        @click="handleJoinShoot"
      >
        {{ buttonText }}
      </BaseButton>
      <BaseButton
        variant="text"
        @click="$emit('cancel')"
      >
        Cancel
      </BaseButton>
    </ButtonGroup>
  </div>
</template>

<style scoped>
.join-shoot-form {
  padding: 0;
}

.form-title {
  margin: 0 0 0.5rem 0;
  color: var(--color-highlight, #4CAF50);
  font-size: 1.1rem;
  font-weight: 600;
}

.form-description {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-mute, #666);
  font-size: 0.9rem;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1.5rem;
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

.code-input {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  max-width: 120px;
  margin: 0 auto;
  display: block;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-highlight, #4CAF50);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-background-mute, #f5f5f5);
}

.form-hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: var(--color-text-mute, #666);
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .code-input {
    font-size: 18px;
    max-width: 100%;
  }
}
</style>