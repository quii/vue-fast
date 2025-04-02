<script setup>
import { ref, computed } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";

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

// Prepare info displays
const infoDisplays = computed(() => {
  const displays = [];

  if (props.arrowsRemaining !== null) {
    displays.push({
      value: props.arrowsRemaining,
      label: "Arrows left"
    });
  }

  if (props.maxPossibleScore !== null) {
    displays.push({
      value: props.maxPossibleScore,
      label: "Max score"
    });
  }

  return displays;
});

// Prepare action buttons
const actionButtons = computed(() => {
  return [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
            </svg>`,
      label: "Class",
      action: "toggle-expand",
      active: false,
      disabled: !props.availableClassifications
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>`,
      label: "Note",
      action: "take-note"
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>`,
      label: "Clear",
      action: "clear-scores",
      disabled: !props.hasStarted
    }
  ];
});

function handleAction(actionData) {
  if (actionData.action === "clear-scores") {
    showConfirmation.value = true;
  } else if (actionData.action === "take-note") {
    emit("take-note");
  }
}

function clearScores() {
  emit("clear-scores");
  showConfirmation.value = false;
}

function cancelClear() {
  showConfirmation.value = false;
}
</script>

<template>
  <BaseTopBar
    :info-displays="infoDisplays"
    :action-buttons="actionButtons"
    :has-expandable-content="!!availableClassifications"
    alignment="spread"
    @action="handleAction"
  >
    <template #expandable-content>
      <ClassificationDetailsTable
        :max-possible-score="maxPossibleScore"
        :arrows-remaining="arrowsRemaining"
        :available-classifications="availableClassifications"
      />
    </template>
  </BaseTopBar>

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

.modal-content h3 {
  margin-top: 0;
  color: #dc3545;
}

.confirmation-actions {
  display: flex;
  gap: 1em;
  margin-top: 1.5em;
}
</style>
