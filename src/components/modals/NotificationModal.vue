<script setup>
import BaseModal from './BaseModal.vue'
import NotificationSettings from '../leaderboard/NotificationSettings.vue'
import BaseButton from '../ui/BaseButton.vue'
import ButtonGroup from '../ui/ButtonGroup.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  shootCode: {
    type: String,
    required: true
  },
  pushNotificationManager: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function handleClose() {
  emit('close')
}
</script>

<template>
  <!-- Always render if visible, handle null pushNotificationManager inside -->
  <BaseModal
    v-if="visible"
    title="Alert Settings"
    @close="handleClose"
  >
    <div v-if="pushNotificationManager">
      <NotificationSettings
        :shoot-code="shootCode"
        :push-notification-manager="pushNotificationManager"
      />
    </div>
    <div v-else class="no-notifications">
      <p>Push notifications are not available in your browser or have not been initialized yet.</p>
      <p>Try refreshing the page or check your browser's notification permissions.</p>
    </div>

    <ButtonGroup>
      <BaseButton
        variant="outline"
        @click="handleClose"
      >
        Close
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<style scoped>
.no-notifications {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-mute, #666);
  margin-bottom: 1.5rem;
}

.no-notifications p {
  margin: 0.5rem 0;
  line-height: 1.4;
}
</style>
