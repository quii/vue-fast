<script setup>
import { ref, computed } from 'vue'
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

// Make shareUrl reactive by using computed
const shareUrl = computed(() => `${window.location.origin}/leaderboard?joincode=${props.shootCode}`)

const copySuccess = ref(false)
const copyError = ref(false)

function closeModal() {
  emit('close')
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareUrl.value) // Note: .value because it's computed
    copySuccess.value = true
    copyError.value = false

    // Reset the success state after 2 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    copyError.value = true
    copySuccess.value = false

    // Reset the error state after 3 seconds
    setTimeout(() => {
      copyError.value = false
    }, 3000)
  }
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
          :size="350"
        />
      </div>

      <div class="url-container">
        <p class="url-label">Or share this link:</p>
        <div
          class="url-display"
          :class="{ 'copy-success': copySuccess, 'copy-error': copyError }"
          @click="copyToClipboard"
          role="button"
          tabindex="0"
          @keydown.enter="copyToClipboard"
          @keydown.space.prevent="copyToClipboard"
        >
          <span class="url-text">{{ shareUrl }}</span>
          <span class="copy-hint" v-if="!copySuccess && !copyError">
            👆 Tap to copy
          </span>
          <span class="copy-feedback success" v-if="copySuccess">
            ✅ Copied!
          </span>
          <span class="copy-feedback error" v-if="copyError">
            ❌ Copy failed
          </span>
        </div>
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
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

.url-display:hover {
  background-color: var(--color-highlight-light, #e8f5e8);
  border-color: var(--color-highlight, #4CAF50);
}

.url-display:focus {
  outline: none;
  border-color: var(--color-highlight, #4CAF50);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.url-display.copy-success {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.url-display.copy-error {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.url-text {
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
}

.copy-hint {
  font-size: 0.7rem;
  color: var(--color-text-mute, #666);
  font-family: system-ui, sans-serif;
  margin-top: 0.25rem;
}

.copy-feedback {
  font-size: 0.8rem;
  font-weight: 600;
  font-family: system-ui, sans-serif;
  margin-top: 0.25rem;
}

.copy-feedback.success {
  color: #28a745;
}

.copy-feedback.error {
  color: #dc3545;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

/* Mobile-specific improvements */
@media (max-width: 480px) {
  .url-display {
    padding: 1rem;
    font-size: 0.75rem;
  }

  .copy-hint {
    font-size: 0.65rem;
  }
}
</style>