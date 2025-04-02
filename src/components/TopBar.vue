<script setup>
import { ref, computed } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import ClassificationIcon from "@/components/icons/ClassificationIcon.vue";
import NoteIcon from "@/components/icons/NoteIcon.vue";
import ClearIcon from "@/components/icons/ClearIcon.vue";

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
      iconComponent: ClassificationIcon,
      label: "Class",
      action: "toggle-expand",
      active: false,
      disabled: !props.availableClassifications
    },
    {
      iconComponent: NoteIcon,
      label: "Note",
      action: "take-note"
    },
    {
      iconComponent: ClearIcon,
      label: "Clear",
      action: "clear-scores",
      disabled: !props.hasStarted,
      variant: "danger"
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

.filter-button.delete-button {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.filter-button.delete-button:active {
  background-color: rgba(220, 53, 69, 0.2);
}
</style>
