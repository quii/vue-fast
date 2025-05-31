<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 300  // Increased from 256
  },
  errorCorrectionLevel: {
    type: String,
    default: 'M',
    validator: (value) => ['L', 'M', 'Q', 'H'].includes(value)
  }
})

const qrDataUrl = ref('')
const isLoading = ref(false)
const error = ref('')

const qrOptions = computed(() => ({
  width: props.size,
  margin: 4,  // Increased margin for better scanning
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: props.errorCorrectionLevel
}))

async function generateQRCode() {
  console.log('generateQRCode called with:', props.url)

  if (!props.url) {
    console.log('Early return - missing url')
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    console.log('About to generate QR code with options:', qrOptions.value)
    const dataUrl = await QRCode.toDataURL(props.url, qrOptions.value)
    qrDataUrl.value = dataUrl
    console.log('QR code generated successfully, data URL length:', dataUrl.length)
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    error.value = 'Failed to generate QR code'
  } finally {
    isLoading.value = false
  }
}

// Generate QR code when component mounts or URL changes
onMounted(() => {
  generateQRCode()
})

watch(() => props.url, () => {
  generateQRCode()
})

watch(() => props.size, () => {
  generateQRCode()
})
</script>

<template>
  <div class="qr-code-generator">
    <div v-if="isLoading" class="loading-state">
      <p>Generating QR code...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="generateQRCode" class="retry-button">
        Try Again
      </button>
    </div>

    <img
      v-else-if="qrDataUrl"
      :src="qrDataUrl"
      :width="size"
      :height="size"
      alt="QR Code"
      class="qr-image"
      style="
        max-width: 100%;
        height: auto;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: -moz-crisp-edges;
        image-rendering: pixelated;
      "
    />

    <div v-else>
      No QR code generated
    </div>
  </div>
</template>

<style scoped>
.qr-code-generator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 1rem;
}

.loading-state p {
  margin: 0;
  color: var(--color-text-mute, #666);
  font-size: 0.9rem;
}

.error-message {
  margin: 0 0 1rem 0;
  color: var(--color-danger, #dc3545);
  font-size: 0.9rem;
  text-align: center;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-button:hover {
  background-color: var(--color-highlight-dark, #45a049);
}

.qr-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive sizing */
@media (max-width: 480px) {
  .qr-image {
    max-width: 200px;
  }
}
</style>