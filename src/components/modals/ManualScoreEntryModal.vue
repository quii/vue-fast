<script setup>
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import FormGroup from "@/components/ui/FormGroup.vue";
import { getAllShootStatuses } from "@/domain/shoot/shoot_status.js";
import { roundConfigManager } from "@/domain/scoring/game_types.js";
import { formatRoundName } from "@/domain/scoring/round/formatting.js";
import { calculateMaxPossibleScore } from "@/domain/scoring/scores.js";

const props = defineProps({
  visible: Boolean,
  initialDate: {
    type: String,
    default: () => new Date().toISOString().substr(0, 10)
  },
  initialStatus: {
    type: String,
    default: "Practice"
  },
  selectedRound: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["save", "cancel", "selectRound"]);

// Local state
const date = ref(props.initialDate);
const shootStatus = ref(props.initialStatus);
const roundType = ref(props.selectedRound);
const score = ref("");

// Watch for changes to the selectedRound prop
watch(() => props.selectedRound, (newRound) => {
  if (newRound) {
    roundType.value = newRound;
  }
});

const isValid = computed(() => {
  return (
    date.value &&
    roundType.value &&
    score.value &&
    !isNaN(parseInt(score.value)) &&
    parseInt(score.value) >= 0 &&
    !scoreError.value
  );
});

// Available statuses
const shootStatuses = getAllShootStatuses();

// Format round name for display
const formattedRoundName = computed(() => {
  if (!roundType.value) return "";
  return formatRoundName(roundType.value);
});

// Get max possible score for the selected round
const maxPossibleScore = computed(() => {
  if (!roundType.value) return null;

  const round = roundConfigManager.getRound(roundType.value);
  if (!round) return null;

  // Calculate max possible score based on the number of arrows and max arrow score
  return calculateMaxPossibleScore(0, round.maxArrows, roundType.value);
});

// Validate score is within range
const scoreError = computed(() => {
  if (!score.value) return null;
  if (isNaN(parseInt(score.value))) return "Please enter a valid number";

  const scoreNum = parseInt(score.value);
  if (scoreNum < 0) return "Score cannot be negative";

  if (maxPossibleScore.value !== null && scoreNum > maxPossibleScore.value) {
    return `Maximum possible score for ${formattedRoundName.value} is ${maxPossibleScore.value}`;
  }

  return null;
});

// Reset when modal becomes visible
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    date.value = props.initialDate;
    shootStatus.value = props.initialStatus;
    // Don't reset roundType if it's already set from props
    if (props.selectedRound) {
      roundType.value = props.selectedRound;
    }
    score.value = "";
  }
});

function handleSave() {
  if (!isValid.value) return;

  emit("save", {
    date: date.value,
    shootStatus: shootStatus.value,
    gameType: roundType.value,
    score: parseInt(score.value)
  });
}

function handleCancel() {
  emit("cancel");
}

function openRoundSelection() {
  emit("selectRound");
}
</script>

<template>
  <BaseModal v-if="visible" title="Add Manual Score">
    <p>Enter the details of a shoot you completed elsewhere:</p>

    <!-- Round selection -->
    <FormGroup label="Round Type:">
      <div class="round-selector" @click="openRoundSelection">
        <div v-if="roundType" class="selected-round">
          {{ formattedRoundName }}
        </div>
        <div v-else class="no-round-selected">
          Tap to select a round
        </div>
        <div class="selector-arrow">›</div>
      </div>
    </FormGroup>

    <!-- Score input -->
    <FormGroup label="Final Score:">
      <BaseInput
        v-model="score"
        type="number"
        placeholder="Enter your score"
        min="0"
        :max="maxPossibleScore"
        required
      />
      <p v-if="scoreError" class="error-message">{{ scoreError }}</p>
      <p v-if="maxPossibleScore && !scoreError" class="info-message">
        Maximum score: {{ maxPossibleScore }}
      </p>
    </FormGroup>

    <!-- Date selection -->
    <FormGroup label="Date:">
      <input
        type="date"
        v-model="date"
        class="date-input"
        required
      >
    </FormGroup>

    <!-- Shoot status selection -->
    <FormGroup label="Shoot Type:">
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
    </FormGroup>

    <ButtonGroup>
      <BaseButton
        variant="outline"
        @click="handleCancel">
        Cancel
      </BaseButton>
      <BaseButton
        class="save-button"
        variant="primary"
        :disabled="!isValid"
        @click="handleSave">
        Save to History
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<style scoped>
.round-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75em;
  border-radius: 6px;
  border: 1px solid var(--color-border, #ccc);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1em;
  cursor: pointer;
}

.no-round-selected {
  color: var(--color-text-light, #999);
}

.selector-arrow {
  font-size: 1.5em;
  color: var(--color-text-light);
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
  border-color: var(--color-primary);
}

.radio-option input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.6em;
  height: 0.6em;
  background-color: var(--color-primary);
  border-radius: 50%;
}

.radio-option label {
  font-size: 1em;
  cursor: pointer;
}

.error-message {
  color: var(--color-danger, #ff3b30);
  font-size: 0.85em;
  margin-top: 0.25em;
}

.info-message {
  color: var(--color-text-light, #666);
  font-size: 0.85em;
  margin-top: 0.25em;
}
</style>