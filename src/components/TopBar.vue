<script setup>
import { ref } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";

const props = defineProps({
  hasStarted: {
    type: Boolean,
    default: false
  },
  arrowsRemaining: {
    type: Number,
    default: null
  },
  maxPossibleScore: {
    type: Number,
    default: null
  },
  availableClassifications: {
    type: Array,
    default: null
  }
});

const emit = defineEmits(["clear-scores", "take-note"]);
const showConfirmation = ref(false);
const showClassificationDetails = ref(false);

function confirmClear() {
  showConfirmation.value = true;
}

function clearScores() {
  emit("clear-scores");
  showConfirmation.value = false;
}

function cancelClear() {
  showConfirmation.value = false;
}

function takeNote() {
  emit("take-note");
}

function toggleClassificationDetails() {
  if (props.availableClassifications) {
    showClassificationDetails.value = !showClassificationDetails.value;
  }
}
</script>

<template>
  <div class="top-bar-container">
    <div class="filters-container">
      <div class="filters">
        <!-- Arrows Remaining Display (non-interactive) -->
        <div class="info-display" v-if="arrowsRemaining !== null">
          <div class="info-value">{{ arrowsRemaining }}</div>
          <div class="info-label">Arrows left</div>
        </div>

        <!-- Max Possible Score Display (non-interactive) -->
        <div class="info-display" v-if="maxPossibleScore !== null">
          <div class="info-value">{{ maxPossibleScore }}</div>
          <div class="info-label">Max score</div>
        </div>

        <!-- Classification Button -->
        <button
          class="filter-button"
          :class="{
            'active': showClassificationDetails,
            'disabled': !availableClassifications
          }"
          @click="toggleClassificationDetails"
          :disabled="!availableClassifications"
          aria-label="Show classification details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <circle cx="12" cy="8" r="6"></circle>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
          </svg>
          <span class="filter-label">Class</span>
        </button>

        <!-- Take Note Button -->
        <button
          class="filter-button"
          @click="takeNote"
          aria-label="Take a note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span class="filter-label">Note</span>
        </button>

        <!-- Clear Scores Button - Always visible but disabled when not started -->
        <button
          class="filter-button"
          :class="{ 'disabled': !hasStarted }"
          @click="confirmClear"
          :disabled="!hasStarted"
          aria-label="Clear scores"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span class="filter-label">Clear</span>
        </button>
      </div>
    </div>

    <!-- Expandable Classification Details -->
    <div v-if="showClassificationDetails && availableClassifications" class="classification-details-container">
      <ClassificationDetailsTable
        :max-possible-score="maxPossibleScore"
        :arrows-remaining="arrowsRemaining"
        :available-classifications="availableClassifications"
      />
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h3>Clear all scores?</h3>
        <p>Are you sure you want to clear all scores for this shoot? This cannot be undone.</p>
        <div class="confirmation-actions">
          <BaseButton
            variant="danger"
            @click="clearScores">
            Yes, clear all scores
          </BaseButton>
          <BaseButton
            variant="outline"
            @click="cancelClear">
            Cancel
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border-light);
}

.filters-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin: 0.5em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters {
  display: flex;
  justify-content: space-around;
  padding: 0.75em 0.5em;
}

.filter-button, .info-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--color-background);
  border: none;
  color: var(--color-text-light);
  transition: all 0.2s ease;
  padding: 0.5em;
}

.filter-button {
  cursor: pointer;
}

.filter-button:active {
  transform: scale(0.95);
}

.filter-button.active {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
}

.filter-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--color-background-mute);
  border: none;
  color: var(--color-text-light);
  padding: 0.5em;
  cursor: default;
}

.filter-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 0.25em;
}

.filter-label, .info-label {
  font-size: 0.7em;
  font-weight: 500;
  text-align: center;
  line-height: 1;
  margin-bottom: 0.3em;
}

.info-value {
  font-size: 1.2em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.classification-details-container {
  padding: 0 0.5em 0.5em 0.5em;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90vw;
  max-width: 400px;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  color: #dc3545;
}

.confirmation-actions {
  display: flex;
  gap: 1em;
  margin-top: 1.5em;
}

@media (min-width: 768px) {
  .filters {
    justify-content: center;
    gap: 1.5rem;
  }

  .filter-button, .info-display {
    width: 70px;
  }
}
</style>
