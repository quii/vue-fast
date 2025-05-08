<script setup>
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ButtonStack from '@/components/ui/ButtonStack.vue'
import { ref, onMounted } from 'vue'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import CaptainInputModal from '@/components/modals/CaptainInputModal.vue'
import ScoreSheetPdfGenerator from '@/components/pdf/ScoreSheetPdfGenerator.vue'
import { generateScoreSheetSvg, svgToPng } from '@/utils/scoreSheetGenerator.js'
import { shareToWhatsApp, copyImageToClipboard, copyTextToClipboard, isMobileDevice } from '@/utils/shareUtils.js'

const props = defineProps([
  'shoot',
  'archerName',
  'endSize',
  'ageGroup',
  'gender',
  'bowType',
  'gameType',
  'date',
  'status',
  'handicap',
  'classification'
])

const emit = defineEmits(['close'])
const shotAt = ref('')
const captainName = ref('')
const showCopySuccess = ref(false)
const svgData = ref(null)
const isGenerating = ref(false)
const showCaptainPrompt = ref(false)
const pdfGeneratorRef = ref(null)

// Generate SVG preview when component mounts
onMounted(async () => {
  await generatePreview()
})

// Generate the score sheet preview
async function generatePreview() {
  if (isGenerating.value) return

  isGenerating.value = true
  try {
    svgData.value = await generateScoreSheetSvg({
      gameType: props.gameType,
      date: props.date,
      shotAt: shotAt.value,
      archerName: props.archerName,
      gender: props.gender,
      handicap: props.handicap,
      bowType: props.bowType,
      ageGroup: props.ageGroup,
      classification: props.classification,
      scores: props.shoot.scores,
      endSize: props.endSize
    })
  } catch (error) {
    console.error('Failed to generate preview:', error)
  } finally {
    isGenerating.value = false
  }
}

// Handle PDF download button click
function handlePrintClick() {
  showCaptainPrompt.value = true
}

// Handle captain name submission
function handleCaptainSubmit(name) {
  captainName.value = name // Set the captainName value
  showCaptainPrompt.value = false

  // Add a small delay to ensure the prop is updated
  setTimeout(() => {
    // Generate PDF using the ScoreSheetPdfGenerator component
    if (pdfGeneratorRef.value) {
      pdfGeneratorRef.value.generatePdf()
      emit('close')
    }
  }, 0)
}

// Copy score sheet to clipboard
async function copyToClipboard() {
  try {
    // Ensure we have SVG data
    if (!svgData.value) {
      await generatePreview()
    }

    // Convert SVG to PNG
    const pngData = await svgToPng(svgData.value)

    // Get PNG as blob
    const response = await fetch(pngData)
    const blob = await response.blob()

    // Try to copy the image
    const success = await copyImageToClipboard(blob)

    if (!success) {
      // Fallback to copying text if image copy fails
      const scoreTotal = calculateTotalScore()
      const shareText = `${props.archerName} scored ${scoreTotal} on a ${props.gameType} round${shotAt.value ? ` at ${shotAt.value}` : ''}!`
      await copyTextToClipboard(shareText)
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

// Share to WhatsApp
async function shareToWhatsAppHandler() {
  try {
    // Ensure we have SVG data
    if (!svgData.value) {
      await generatePreview()
    }

    // Convert SVG to PNG
    const pngData = await svgToPng(svgData.value)

    // Try to use Web Share API on mobile devices
    if (navigator.share && isMobileDevice()) {
      try {
        const response = await fetch(pngData)
        const blob = await response.blob()
        const file = new File([blob], `${props.archerName}-${props.gameType}.png`, { type: 'image/png' })

        await navigator.share({
          title: `${props.archerName}'s ${props.gameType} Score`,
          files: [file]
        })

        emit('close')
        return
      } catch (error) {
        console.log('Error sharing with Web Share API:', error)
      }
    }

    // Fallback to basic WhatsApp sharing
    const scoreTotal = calculateTotalScore()
    const shareText = `${props.archerName} scored ${scoreTotal} on a ${props.gameType} round${shotAt.value ? ` at ${shotAt.value}` : ''}!`
    shareToWhatsApp(shareText)
    emit('close')
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error)
  }
}

// Calculate total score from all ends
function calculateTotalScore() {
  return props.shoot.scores.reduce((total, end) => {
    if (Array.isArray(end)) {
      return total + end.reduce((endTotal, arrow) => endTotal + (parseInt(arrow) || 0), 0)
    }
    return total
  }, 0)
}
</script>

<template>
  <BaseModal title="Share Score Sheet">
    <form @submit.prevent>
      <div class="form-group">
        <label for="location">Shot At</label>
        <input
          id="location"
          v-model="shotAt"
          type="text"
          placeholder="Enter location (optional)"
          @input="svgData = null"
          autofocus
        >
      </div>

      <!-- SVG Preview -->
      <div class="preview-container">
        <h3>Score Sheet Preview</h3>
        <div v-if="isGenerating" class="generating-message">
          Generating preview...
        </div>
        <div v-else-if="svgData" class="svg-preview">
          <img :src="svgData" alt="Score Sheet Preview" />
        </div>
        <div v-else class="no-preview">
          <button type="button" @click="generatePreview" class="generate-button">
            Generate Preview
          </button>
        </div>
      </div>
    </form>

    <!-- Share Options -->
    <div class="share-options">
      <ButtonStack spacing="medium">
        <BaseButton
          type="button"
          variant="outline"
          @click="copyToClipboard"
          :disabled="!svgData"
          fullWidth
        >
          <CopyIcon class="button-icon" />
          <span v-if="showCopySuccess">Copied to Clipboard!</span>
          <span v-else>Copy to Clipboard</span>
        </BaseButton>

        <BaseButton
          type="button"
          variant="outline"
          @click="shareToWhatsAppHandler"
          :disabled="!svgData"
          fullWidth
          class="share-button"
        >
          <WhatsAppIcon class="button-icon share-icon" />
          <span>Share Score Sheet</span>
        </BaseButton>

        <BaseButton
          type="button"
          @click="handlePrintClick"
          fullWidth
          variant="outline"
          data-test="view-shoot-save2"
        >
          <span>Download PDF</span>
        </BaseButton>
      </ButtonStack>
    </div>

    <div class="button-group cancel-group">
      <BaseButton
        type="button"
        variant="text"
        @click="emit('close')"
        fullWidth
      >
        Cancel
      </BaseButton>
    </div>

    <!-- Hidden PDF Generator Component -->
    <ScoreSheetPdfGenerator
      ref="pdfGeneratorRef"
      :archer-name="props.archerName"
      :shot-at="shotAt"
      :target-captain="captainName"
      :shoot="props.shoot"
      :game-type="props.gameType"
      :date="props.date"
      :age-group="props.ageGroup"
      :gender="props.gender"
      :bow-type="props.bowType"
      :status="props.status"
      :handicap="props.handicap"
      :classification="props.classification"
      :end-size="props.endSize"
    />
  </BaseModal>

  <!-- Captain Input Modal -->
  <CaptainInputModal
    :show="showCaptainPrompt"
    @close="showCaptainPrompt = false"
    @submit="handleCaptainSubmit"
  />
</template>

<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.preview-container {
  margin: 1.5rem 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
}

.preview-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.svg-preview {
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
}

.svg-preview img {
  max-width: 100%;
  display: block;
}

.generating-message, .no-preview {
  text-align: center;
  padding: 2rem 0;
  font-style: italic;
  color: var(--color-text-light);
}

.generate-button {
  background-color: var(--color-primary, #4a5568);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}

.share-options {
  margin-top: 1.5rem;
}

.share-options h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.cancel-group {
  margin-top: 1.5rem;
  text-align: center;
}

.button-icon {
  margin-right: 0.5rem;
}

/* Special styling for WhatsApp button */
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
