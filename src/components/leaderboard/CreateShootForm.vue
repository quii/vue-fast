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

const emit = defineEmits(['shoot-created'])

const shootStore = useShootStore()

// Local state
const isCreating = ref(false)

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

// Methods
async function handleCreateShoot() {
  if (!canCreate.value) return

  try {
    isCreating.value = true
    const code = await shootStore.createShoot(props.userName)
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
</style>