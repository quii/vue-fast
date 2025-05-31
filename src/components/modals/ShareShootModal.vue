<script setup>
import BaseModal from './BaseModal.vue'
import QRCodeGenerator from '@/components/ui/QRCodeGenerator.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  shootCode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const shareUrl = `${window.location.origin}/leaderboard?joincode=${props.shootCode}`

function closeModal() {
  emit('close')
}
</script>

<template>
  <BaseModal v-if="visible" title="Share Shoot">
    <div class="share-content">
      <p class="share-description">
        Share this QR code with others so they can join your shoot:
      </p>

      <div class="qr-container">
        <QRCodeGenerator
          :url="shareUrl"
          :size="250"
        />
      </div>

      <div class="url-container">
        <p class="url-label">Or share this link:</p>
        <div class="url-display">{{ shareUrl }}</div>
      </div>

      <div class="modal-actions">
        <BaseButton variant="primary" @click="closeModal">
          Close
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.share-content {
  text-align: center;
}

.share-description {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-mute, #666);
  font-size: 0.9rem;
  line-height: 1.4;
}

.qr-container {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
}

.url-container {
  margin: 1.5rem 0;
}

.url-label {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 600;
}

.url-display {
  background-color: var(--color-surface, #f5f5f5);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 4px;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
  color: var(--color-text);
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>