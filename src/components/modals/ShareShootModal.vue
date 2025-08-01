<script setup>
import { ref, computed, inject } from 'vue'
import BaseModal from './BaseModal.vue'
import QRCodeGenerator from '@/components/ui/QRCodeGenerator.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonGroup from '@/components/ui/ButtonGroup.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  shootCode: {
    type: String,
    required: true
  },
  shootTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

// Inject sharing service
const sharingService = inject('sharingService')

// Make shareUrls reactive by using computed
const joinUrl = computed(() => `${window.location.origin}/leaderboard?joincode=${props.shootCode}`)
const viewUrl = computed(() => `${window.location.origin}/viewer/${props.shootCode}`)

const shareMessage = computed(() => 
  `Shoot Code: ${props.shootCode}\n\n` +
  `🏹 Join and participate: ${joinUrl.value}\n\n` +
  `👁️ View only: ${viewUrl.value}`
)

const copySuccess = ref('')
const copyError = ref('')
const shareSuccess = ref(false)
const shareError = ref('')

function closeModal() {
  emit('close')
}

async function shareNatively() {
  try {
    if (navigator.share) {
      // Use Web Share API for native sharing
      await navigator.share({
        title: props.shootTitle || `Live Archery Leaderboard`,
        text: shareMessage.value
      })
      
      shareSuccess.value = true
      setTimeout(() => {
        shareSuccess.value = false
      }, 2000)
    } else {
      // Fallback to copying the message to clipboard
      await copyToClipboard(shareMessage.value, 'message')
    }
  } catch (err) {
    // If user cancels the share dialog, don't show it as an error
    if (err.name === 'AbortError') {
      console.log('Share was cancelled by user')
      return
    }
    
    console.error('Failed to share:', err)
    shareError.value = 'Failed to share'
    
    // Reset the error state after 3 seconds
    setTimeout(() => {
      shareError.value = ''
    }, 3000)
  }
}

async function copyToClipboard(url, type) {
  try {
    await navigator.clipboard.writeText(url)
    copySuccess.value = type
    copyError.value = ''

    // Reset the success state after 2 seconds
    setTimeout(() => {
      copySuccess.value = ''
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    copyError.value = type
    copySuccess.value = ''

    // Reset the error state after 3 seconds
    setTimeout(() => {
      copyError.value = ''
    }, 3000)
  }
}

// Check if native sharing is available
const canShareNatively = computed(() => {
  // Check if Web Share API is available, regardless of device type
  return !!navigator.share && !!sharingService
})
</script>

<template>
  <BaseModal v-if="visible" title="Share Shoot">
    <div class="share-content">
      <p class="share-description">
        Share shoot code <strong>#{{ shootCode }}</strong> with others
      </p>

      <!-- QR Code for easy scanning -->
      <div class="qr-section">
        <p class="section-label">Scan QR code to join:</p>
        <div class="qr-container">
          <QRCodeGenerator
            :url="joinUrl"
            :size="280"
          />
        </div>
      </div>

      <!-- Feedback messages -->
      <div v-if="shareSuccess || shareError" class="feedback-section">
        <div v-if="shareSuccess" class="feedback success">
          ✅ Shared successfully!
        </div>
        <div v-if="shareError" class="feedback error">
          ❌ {{ shareError }}
        </div>
      </div>

      <ButtonGroup>
        <BaseButton 
          v-if="canShareNatively"
          variant="primary" 
          @click="shareNatively"
          :disabled="!!shareError"
        >
          Share Shoot
        </BaseButton>
        <BaseButton variant="outline" @click="closeModal">
          Close
        </BaseButton>
      </ButtonGroup>
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

.qr-section {
  margin-bottom: 1.5rem;
}

.feedback-section {
  margin-bottom: 1.5rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-label {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 600;
}

.qr-container {
  display: flex;
  justify-content: center;
}
</style>

