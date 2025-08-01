<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
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

const emit = defineEmits(['shoot-created'])

const shootStore = useShootStore()

// Local state
const isCreating = ref(false)
const shootTitle = ref('')

// Computed
const canCreate = computed(() => {
  return !isCreating.value && !shootStore.isLoading
})

const buttonText = computed(() => {
  if (isCreating.value || shootStore.isLoading) {
    return 'Creating...'
  }
  return 'Create Shoot'
})

const trimmedTitle = computed(() => {
  return shootTitle.value.trim()
})

// Methods
async function handleCreateShoot() {
  if (!canCreate.value) return

  try {
    isCreating.value = true
    const title = trimmedTitle.value || undefined
    await shootStore.createShoot(props.userName, props.roundType, 0, 0, title)
    // The store doesn't return a code, so we get it from the currentShoot
    const code = shootStore.shootCode
    emit('shoot-created', code)
  } catch (error) {
    // Error handling is done in the store with toast notifications
    console.error('Failed to create shoot:', error)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="create-shoot-action">
    <h4 class="action-title">Create New Shoot</h4>
    <p class="action-description">
      Start a new shared leaderboard for <strong>{{ userName }}</strong> shooting <strong>{{ roundType }}</strong>.
    </p>

    <div class="form-group">
      <label for="shoot-title" class="form-label">Shoot Title (Optional)</label>
      <BaseInput
        id="shoot-title"
        v-model="shootTitle"
        type="text"
        placeholder="e.g., Club Championship Round 1"
        maxlength="100"
        :disabled="!canCreate"
        class="title-input"
      />
      <p class="form-hint">
        Add a descriptive title for your shoot (up to 100 characters)
      </p>
    </div>

    <ButtonGroup>
      <BaseButton
        variant="primary"
        :disabled="!canCreate"
        @click="handleCreateShoot"
      >
        {{ buttonText }}
      </BaseButton>
    </ButtonGroup>
  </div>
</template>

<style scoped>
.create-shoot-action {
  padding: 0;
  text-align: center;
}

.action-title {
  margin: 0 0 0.75rem 0;
  color: var(--color-highlight, #4CAF50);
  font-size: 1.1rem;
  font-weight: 600;
}

.action-description {
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
  font-weight: 500;
  color: var(--color-text, #333);
  font-size: 0.9rem;
}

.title-input {
  width: 100%;
}

.form-hint {
  margin: 0.5rem 0 0 0;
  color: var(--color-text-mute, #666);
  font-size: 0.8rem;
  line-height: 1.3;
}
</style>