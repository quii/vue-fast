<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

onMounted(() => {
  window.addEventListener('resize', updateHighlightPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHighlightPosition)
})


const emit = defineEmits(['close'])

const preferencesStore = usePreferencesStore()
const currentStep = ref(0)
const highlightPosition = ref({})

const steps = [
  {
    targetSelector: '.game-type-selector',
    title: 'Round Selection',
    content: 'This is the round you are currently shooting. If you wish to change it, tap it to go to the round selector and pick a different one.'
  },
  {
    targetSelector: '.score-buttons, .interactive-target-face',
    title: 'Scoring',
    content: 'Tap the numbers to record your score. Fast will automatically do all the maths for you! You can rotate your phone landscape to see the full scorecard'
  },
  {
    targetSelector: '.top-bar-container',
    title: 'Top Bar',
    content: 'Here you can clear scores, take notes, or press the "Class" button to see classification details and score requirements for your current round.'
  }
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)

// Update highlight position when step changes
watch([currentStep, () => props.visible], () => {
  if (props.visible) {
    updateHighlightPosition()
  }
}, { immediate: true })

function updateHighlightPosition() {
  const step = steps[currentStep.value]
  const elements = document.querySelectorAll(step.targetSelector)

  if (elements.length === 0) {
    console.warn(`No elements found for selector: ${step.targetSelector}`)
    // Default position if element not found
    highlightPosition.value = {
      top: '50%',
      left: '50%',
      width: '80%',
      height: '100px',
      transform: 'translate(-50%, -50%)'
    }
    return
  }

  // If multiple elements match, create a bounding box that encompasses all of them
  if (elements.length > 1) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    elements.forEach(el => {
      const rect = el.getBoundingClientRect()
      minX = Math.min(minX, rect.left)
      minY = Math.min(minY, rect.top)
      maxX = Math.max(maxX, rect.right)
      maxY = Math.max(maxY, rect.bottom)
    })

    highlightPosition.value = {
      top: `${minY}px`,
      left: `${minX}px`,
      width: `${maxX - minX}px`,
      height: `${maxY - minY}px`
    }
  } else {
    // Single element
    const rect = elements[0].getBoundingClientRect()
    highlightPosition.value = {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    }
  }
}

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    completeTutorial()
  }
}

function completeTutorial() {
  preferencesStore.dismissScoreCardTutorial()
  emit('close')
}

function skipTutorial() {
  preferencesStore.dismissScoreCardTutorial()
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="tutorial-overlay">
    <div class="tutorial-backdrop"></div>

    <div class="highlight-area" :style="highlightPosition"></div>

    <div class="tutorial-tooltip">
      <h3>{{ steps[currentStep].title }}</h3>
      <p>{{ steps[currentStep].content }}</p>

      <div class="tutorial-actions">
        <button class="skip-button" @click="skipTutorial">Skip</button>
        <button class="next-button" @click="nextStep">
          {{ isLastStep ? 'Got it!' : 'Next' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: all;
}

.tutorial-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

.highlight-area {
  position: absolute;
  z-index: 1001;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--color-primary, #4caf50);
  border-radius: 4px;
  box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.tutorial-tooltip {
  position: fixed;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-background);
  color: var(--color-text);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 85%;
  max-width: 400px;
  z-index: 1002;
  border: 1px solid var(--color-border);
}

.tutorial-tooltip h3 {
  margin-top: 0;
  color: var(--color-primary, #4caf50);
}

.tutorial-tooltip p {
  color: var(--color-text);
}

.tutorial-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.next-button {
  background-color: var(--color-primary, #4caf50);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.skip-button {
  background-color: transparent;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 0.5rem 1rem;
}
</style>