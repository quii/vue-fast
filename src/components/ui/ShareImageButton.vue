<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.vue'
import { shareToWhatsApp, copyImageToClipboard, copyTextToClipboard, isMobileDevice } from '@/utils/shareUtils.js'

const props = defineProps({
  // The image data (can be SVG, canvas, or data URL)
  imageData: {
    type: String,
    required: true
  },
  // Text to share if image sharing fails
  fallbackText: {
    type: String,
    required: true
  },
  // Button variant (outline, primary, etc.)
  variant: {
    type: String,
    default: 'outline'
  },
  // Button size
  size: {
    type: String,
    default: 'medium'
  },
  // Whether to show the copy button
  showCopyButton: {
    type: Boolean,
    default: true
  },
  // Whether to make the button full width
  fullWidth: {
    type: Boolean,
    default: false
  },
  // Optional filename for downloads
  filename: {
    type: String,
    default: 'shared-image.png'
  }
})

const emit = defineEmits(['close'])
const showCopySuccess = ref(false)

// Convert image data to PNG
async function convertToPng(imageData) {
  // If it's already a data URL for a PNG, return it
  if (imageData.startsWith('data:image/png;base64,')) {
    return imageData
  }

  // If it's an SVG data URL
  if (imageData.startsWith('data:image/svg+xml;base64,') ||
      imageData.includes('<svg')) {
    // Use the svgToPng utility if available
    if (typeof svgToPng === 'function') {
      return await svgToPng(imageData)
    }

    // Fallback: render SVG to canvas and export as PNG
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = imageData.startsWith('data:')
        ? imageData
        : 'data:image/svg+xml;base64,' + btoa(imageData)
    })
  }

  // If it's a canvas element
  if (imageData instanceof HTMLCanvasElement) {
    return imageData.toDataURL('image/png')
  }

  // Otherwise, assume it's already a PNG data URL
  return imageData
}

// Copy image to clipboard
async function copyToClipboard() {
  try {
    // Convert to PNG
    const pngData = await convertToPng(props.imageData)

    // Get PNG as blob
    const response = await fetch(pngData)
    const blob = await response.blob()

    // Try to copy the image
    const success = await copyImageToClipboard(blob)

    if (!success) {
      // Fallback to copying text if image copy fails
      await copyTextToClipboard(props.fallbackText)
    }

    // Show success message
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Share using device's native share functionality or fallback to WhatsApp
async function shareImage() {
  try {
    // Convert to PNG
    const pngData = await convertToPng(props.imageData)

    // Try to use Web Share API on mobile devices
    if (navigator.share && isMobileDevice()) {
      try {
        const response = await fetch(pngData)
        const blob = await response.blob()
        const file = new File([blob], props.filename, { type: 'image/png' })

        await navigator.share({
          title: props.fallbackText,
          files: [file]
        })

        emit('close')
        return
      } catch (error) {
        console.log('Error sharing with Web Share API:', error)
      }
    }

    // Fallback to basic WhatsApp sharing
    shareToWhatsApp(props.fallbackText)
    emit('close')
  } catch (error) {
    console.error('Error sharing image:', error)
  }
}
</script>

<template>
  <div class="share-buttons">
    <BaseButton
      v-if="showCopyButton"
      type="button"
      :variant="variant"
      :size="size"
      @click="copyToClipboard"
      :fullWidth="fullWidth"
    >
      <CopyIcon class="button-icon" />
      <span v-if="showCopySuccess">Copied to Clipboard!</span>
      <span v-else>Copy to Clipboard</span>
    </BaseButton>

    <BaseButton
      type="button"
      :variant="variant"
      :size="size"
      @click="shareImage"
      :fullWidth="fullWidth"
      class="share-button"
    >
      <WhatsAppIcon class="button-icon share-icon" />
      <span>Share</span>
    </BaseButton>
  </div>
</template>

<style scoped>
.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.button-icon {
  margin-right: 0.5rem;
}

/* Special styling for share button */
.share-button {
  background-color: #25D366;
  color: white;
  border-color: #25D366;
}

.share-button:hover {
  background-color: #1ea952;
  border-color: #1ea952;
}

.share-icon {
  color: white;
  width: 20px;
  height: 20px;
}
</style>