<script setup>
import { ref, computed, watch } from "vue";
import HistoryCard from "@/components/HistoryCard.vue";
import { getAllShootStatuses } from "@/domain/shoot/shoot_status.js";

const props = defineProps({
  // Common props
  visible: Boolean,
  shootData: Object,

  // Mode control
  isEditMode: {
    type: Boolean,
    default: false
  },

  // Initial values
  initialDate: {
    type: String,
    default: () => new Date().toISOString().substr(0, 10)
  },
  initialStatus: {
    type: String,
    default: "Practice"
  }
});

const emit = defineEmits(["save", "cancel"]);

// Local state for editing
const date = ref(props.initialDate);
const shootStatus = ref(props.initialStatus);

// Reset form when props change
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    date.value = props.initialDate;
    shootStatus.value = props.initialStatus;
  }
}, { immediate: true });

// Computed properties for display
const modalTitle = computed(() => props.isEditMode ? "Edit Shoot" : "Save to History");
const saveButtonText = computed(() => props.isEditMode ? "Save Changes" : "Save to History");
const previewData = computed(() => {
  // Start with the original shoot data
  const baseData = props.shootData || {};

  // Create a new object with all the original properties
  return {
    ...baseData,
    // Override only the properties we're editing
    date: date.value,
    shootStatus: shootStatus.value
  };
});

// Available statuses
const shootStatuses = getAllShootStatuses();

function handleSave() {
  emit("save", {
    date: date.value,
    shootStatus: shootStatus.value
  });
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content save-modal">
      <h3>{{ modalTitle }}</h3>
      <p>{{ isEditMode ? "Review your changes before saving:" : "Review your score before saving:" }}</p>

      <div class="history-preview">
        <HistoryCard :item="previewData" />
      </div>

      <!-- Date editing -->
      <div class="edit-section">
        <h4>Date:</h4>
        <div class="date-input-container">
          <input
            type="date"
            v-model="date"
            class="date-input"
          >
        </div>
      </div>

      <!-- Shoot status selection -->
      <div class="shoot-status-selection">
        <h4>Shoot Type:</h4>
        <div class="radio-group">
          <div
            v-for="status in shootStatuses"
            :key="status"
            class="radio-option"
          >
            <input
              type="radio"
              :id="`status-${status}`"
              :value="status"
              v-model="shootStatus"
              :name="'shoot-status'"
            >
            <label :for="`status-${status}`">{{ status === "RecordStatus" ? "Record Status" : status }}</label>
          </div>
        </div>
      </div>

      <div class="confirmation-actions">
        <button
          class="save-button"
          @click="handleSave">
          {{ saveButtonText }}
        </button>
        <button
          class="cancel-button"
          @click="handleCancel">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.save-modal h3 {
  margin-top: 0;
  color: var(--color-highlight, #4CAF50);
  text-align: center;
}

.history-preview {
  margin: 1.5em 0;
}

.confirmation-actions {
  display: flex;
  gap: 1em;
  margin-top: 1.5em;
}

.save-button, .cancel-button {
  flex: 1;
  padding: 0.75em;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
}

.save-button:active {
  background-color: var(--color-highlight-bright, #5FDF63);
  transform: scale(0.98);
}

.cancel-button {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border, #ccc);
}

.cancel-button:active {
  background-color: var(--color-background-mute, #f5f5f5);
  transform: scale(0.98);
}

.date-input-container {
  margin-bottom: 1em;
}

.date-input {
  width: 100%;
  padding: 0.75em;
  border-radius: 6px;
  border: 1px solid var(--color-border, #ccc);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1em;
}

.date-input:focus {
  outline: none;
  border-color: var(--color-highlight, #4CAF50);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.shoot-status-selection {
  margin: 1.5em 0;
}

.edit-section h4, .shoot-status-selection h4 {
  margin-top: 0;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: var(--color-text);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.radio-option input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid var(--color-border, #ccc);
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
}

.radio-option input[type="radio"]:checked {
  border-color: var(--color-highlight, #4CAF50);
}

.radio-option input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.6em;
  height: 0.6em;
  background-color: var(--color-highlight, #4CAF50);
  border-radius: 50%;
}

.radio-option label {
  font-size: 1em;
  cursor: pointer;
}
</style>
