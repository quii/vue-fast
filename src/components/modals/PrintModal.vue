<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import ButtonStack from '@/components/ui/ButtonStack.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ScoreSheetPdfGenerator from '@/components/pdf/ScoreSheetPdfGenerator.vue'
import CaptainInputModal from '@/components/modals/CaptainInputModal.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import type { SharingPort, ScoresheetOptions } from '@/domain/ports/sharing'
import type { HistoryItem } from '@/domain/repositories/player_history'

const sharingService = inject<SharingPort>('sharingService') as SharingPort

interface PrintModalProps {
  shoot: HistoryItem;
  archerName: string;
}

const props = defineProps<PrintModalProps>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const location = ref('')
const scoresheet = ref<string | null>(null)
const showCopySuccess = ref(false)
const showCaptainPrompt = ref(false)
const captainName = ref('')
const pdfGeneratorRef = ref<InstanceType<typeof ScoreSheetPdfGenerator> | null>(null)
const isGenerating = ref(false)
const shotAt = ref('') // This matches the v-model in the template

// Generate preview automatically when component mounts
onMounted(async () => {
  await generatePreview()
})

async function generatePreview() {
  try {
    isGenerating.value = true

    const options: ScoresheetOptions = {
      location: shotAt.value,
      archerName: props.archerName
    }

    scoresheet.value = await sharingService.generateScoresheet(props.shoot, options)
  } catch (error) {
    console.error('Failed to generate preview:', error)
  } finally {
    isGenerating.value = false
  }
}

async function copyToClipboard() {
  if (!scoresheet.value) {
    await generatePreview()
  }

  if (scoresheet.value) {
    const success = await sharingService.copyScoresheet(scoresheet.value)

    // Show success message
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  }
}

async function shareToWhatsAppHandler() {
  if (!scoresheet.value) {
    await generatePreview()
  }

  if (scoresheet.value) {
    const text = `${props.archerName} scored ${props.shoot.score} on a ${props.shoot.gameType} round${shotAt.value ? ` at ${shotAt.value}` : ''}!`

    await sharingService.shareScoresheet(scoresheet.value, text)
    emit('close')
  }
}

function handlePrintClick() {
  showCaptainPrompt.value = true
}

function handleCaptainSubmit(name: string) {
  captainName.value = name
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

// Calculate total score from all ends
function calculateTotalScore(): number {
  return props.shoot.scores.reduce((total, end) => {
    if (Array.isArray(end)) {
      return total + end.reduce((endTotal, arrow) => endTotal + (parseInt(arrow as string) || 0), 0)
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
          @input="scoresheet = null"
          autofocus
        >
      </div>

      <!-- SVG Preview -->
      <div class="preview-container">
        <h3>Score Sheet Preview</h3>
        <div v-if="isGenerating" class="generating-message">
          Generating preview...
        </div>
        <div v-else-if="scoresheet" class="svg-preview">
          <img :src="scoresheet" alt="Score Sheet Preview" />
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
          :disabled="!scoresheet"
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
          :disabled="!scoresheet"
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
      :game-type="props.shoot.gameType"
      :date="props.shoot.date"
      :age-group="props.shoot.userProfile?.ageGroup"
      :gender="props.shoot.userProfile?.gender"
      :bow-type="props.shoot.userProfile?.bowType"
      :status="props.shoot.shootStatus"
      :handicap="props.shoot.handicap"
      :classification="props.shoot.classification"
      :end-size="props.shoot.endSize || 3"
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