<template>
  <div class="sight-marks">
    <BaseTopBar
      :action-buttons="actionButtons"
      alignment="right"
      @action="handleAction"
    />

    <!-- Add a new modal for the estimation feature -->
    <BaseModal v-if="showEstimateModal">
      <div class="form-group">
        <label>Enter Distance</label>
        <div class="distance-input-container">
          <input type="number" v-model="estimateDistance" class="distance-number" />
          <div class="unit-radio-group">
            <label class="unit-radio">
              <input
                type="radio"
                v-model="estimateUnit"
                value="m"
                name="distance-unit"
              />
              <span class="radio-label">meters</span>
            </label>
            <label class="unit-radio">
              <input
                type="radio"
                v-model="estimateUnit"
                value="yd"
                name="distance-unit"
              />
              <span class="radio-label">yards</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="estimatedMark" class="estimated-mark">
        <h3>Estimated Sight Mark</h3>
        <div class="estimate-result">
          <div>Extension: {{ estimatedMark.notches }} notches</div>
          <div>Height: {{ formatVertical(estimatedMark.vertical) }}</div>
        </div>

        <!-- Add label input for saving the mark -->
        <div v-if="showSaveEstimateOptions" class="save-estimate-options">
          <label>Label (optional)</label>
          <input
            type="text"
            v-model="estimateLabel"
            maxlength="100"
            class="label-input"
            placeholder="estimated mark"
          />
        </div>
      </div>

      <div class="dialog-actions">
        <button class="secondary" @click="showEstimateModal = false">Close</button>

        <!-- Show Estimate button when no estimate exists -->
        <button
          v-if="!estimatedMark"
          class="primary"
          @click="calculateEstimate"
        >
          Estimate
        </button>

        <!-- Show Save button when estimate exists but not saved -->
        <button
          v-if="estimatedMark && !showSaveEstimateOptions"
          class="primary"
          @click="showSaveEstimateOptions = true"
        >
          Save to My Marks
        </button>

        <!-- Show Confirm Save button when ready to save -->
        <button
          v-if="showSaveEstimateOptions"
          class="primary"
          @click="saveEstimatedMark"
        >
          Confirm Save
        </button>
      </div>
    </BaseModal>

    <BaseModal v-if="showAddMark">
      <div class="form-group">
        <label>Label (optional)</label>
        <input
          type="text"
          v-model="newMark.label"
          maxlength="100"
          class="label-input"
          placeholder="pink arrows"
        />
        <label>Distance</label>
        <div class="distance-inputs">
          <input type="number" v-model="newMark.distance" class="distance-number" />
          <select v-model="newMark.unit" class="unit-select">
            <option value="m">m</option>
            <option value="yd">yd</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Extension</label>
        <div class="slider-value">{{ displayNotches }} notches</div>
        <input
          type="range"
          v-model="notchesValue"
          min="0"
          max="15"
          step="1"
          class="horizontal-slider"
        />
      </div>

      <div class="form-group">
        <label>Height</label>
        <div class="vertical-inputs">
          <NumberSpinner
            v-model="newMark.vertical.major"
            :min="0"
            :max="10"
          />
          <span class="separator">.</span>
          <NumberSpinner
            v-model="newMark.vertical.minor"
            :min="0"
            :max="10"
          />
          <span class="separator">.</span>
          <NumberSpinner
            v-model="newMark.vertical.micro"
            :min="0"
            :max="10"
          />
        </div>
      </div>

      <div class="dialog-actions">
        <button class="secondary" @click="showAddMark = false">Cancel</button>
        <button class="primary" @click="saveMark">Save</button>
      </div>
    </BaseModal>

    <BaseModal v-if="showDeleteConfirm">
      <p>Delete {{ markToDelete.distance }}{{ markToDelete.unit }}?</p>
      <div class="dialog-actions">
        <button class="secondary" @click="cancelDelete">Cancel</button>
        <button class="primary" @click="confirmDelete">Delete</button>
      </div>
    </BaseModal>

    <div class="marks-list">
      <div
        v-for="mark in marks"
        :key="`${mark.distance}${mark.unit}`"
        class="mark-card"
      >
        <div class="mark-content" @click="editMark(mark)" @touchstart="startLongPress(mark)"
             @touchend="cancelLongPress">
          <div class="mark-distance">{{ mark.distance }}{{ mark.unit }}</div>
          <div class="mark-details">
            <div>Extension: {{ mark.notches }} notches</div>
            <div>Height: {{ formatVertical(mark.vertical) }}</div>
            <div v-if="mark.label" class="mark-label">{{ mark.label }}</div>
          </div>
        </div>
        <button
          class="star-button"
          @click="togglePriority(mark)"
        >
          {{ mark.priority ? "⭐" : "☆" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useSightMarksStore } from "@/stores/sight_marks";
import BaseModal from "@/components/modals/BaseModal.vue";
import NumberSpinner from "@/components/common/NumberSpinner.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import { estimateSightMark, canEstimateSightMark } from "@/domain/sight_marks/estimation";


const store = useSightMarksStore();
const marks = computed(() => store.getMarks());

const showAddMark = ref(false);
const showDeleteConfirm = ref(false);
const markToDelete = ref(null);
const longPressTimer = ref(null);

// New refs for the estimate feature
const showEstimateModal = ref(false);
const estimateDistance = ref(30);
const estimateUnit = ref("m");
const estimatedMark = ref(null);
const estimateLabel = ref("");
const showSaveEstimateOptions = ref(false);

// Check if we have enough marks to enable estimation
const canEstimate = computed(() => canEstimateSightMark(marks.value));

const newMark = ref({
  id: null,
  distance: 20,
  unit: "m",
  notches: 2,
  label: "",
  vertical: {
    major: 5,
    minor: 6,
    micro: 2
  }
})

const notchesValue = computed({
  get() {
    return 15 - newMark.value.notches;
  },
  set(value) {
    newMark.value.notches = 15 - value;
  }
})

const displayNotches = computed(() => newMark.value.notches);

// Define action buttons for the BaseTopBar
const actionButtons = computed(() => {
  const buttons = [
    {
      icon: "➕", // Simple plus icon, could be replaced with a component
      label: "Add Mark",
      action: "add-mark"
    }
  ];

  // Add the Estimate button if we have enough data
  if (canEstimate.value) {
    buttons.push({
      icon: "📏", // Ruler emoji as a simple icon
      label: "Estimate",
      action: "estimate-mark"
    });
  }

  return buttons;
});

function openEstimateModal() {
  showEstimateModal.value = true;
  estimatedMark.value = null;
  estimateLabel.value = "";
  showSaveEstimateOptions.value = false;
}

// Handle actions from the BaseTopBar
function handleAction(actionData) {
  if (actionData.action === "add-mark") {
    showAddMark.value = true;
  } else if (actionData.action === "estimate-mark") {
    openEstimateModal();
  }
}

// Function to calculate the estimated sight mark
function calculateEstimate() {
  estimatedMark.value = estimateSightMark(
    marks.value,
    estimateDistance.value,
    estimateUnit.value
  );
  showSaveEstimateOptions.value = false; // Reset save options when calculating new estimate
}

function saveEstimatedMark() {
  if (!estimatedMark.value) return;

  store.addMark(
    estimateDistance.value,
    estimateUnit.value,
    estimatedMark.value.notches,
    estimatedMark.value.vertical,
    estimateLabel.value
  );

  // Close the modal and reset state
  showEstimateModal.value = false;
  estimatedMark.value = null;
  estimateLabel.value = "";
  showSaveEstimateOptions.value = false;
}

function formatVertical(vertical) {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}

function saveMark() {
  const { id, distance, unit, notches, vertical, label } = newMark.value;
  if (id) {
    store.updateMark(id, distance, unit, notches, vertical, label);
  } else {
    store.addMark(distance, unit, notches, vertical, label);
  }
  showAddMark.value = false;
}

function editMark(mark) {
  newMark.value = {
    id: mark.id,
    distance: mark.distance,
    unit: mark.unit,
    notches: mark.notches,
    label: mark.label || "",
    vertical: {
      major: mark.vertical.major,
      minor: mark.vertical.minor,
      micro: mark.vertical.micro
    }
  };
  showAddMark.value = true;
}


function startLongPress(mark) {
  longPressTimer.value = setTimeout(() => {
    markToDelete.value = mark;
    showDeleteConfirm.value = true;
  }, 500)
}

function cancelLongPress() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
}

function confirmDelete() {
  store.deleteMark(markToDelete.value.id);
  showDeleteConfirm.value = false;
  markToDelete.value = null;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  markToDelete.value = null;
}

function togglePriority(mark) {
  store.togglePriority(mark.distance, mark.unit);
}
</script>

<style scoped>
.mark-label {
  font-style: italic;
  color: var(--color-text);
  opacity: 0.8;
}

.sight-marks {
  padding: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.form-group:last-child {
  border-bottom: none;
}

.distance-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.distance-number {
  font-size: 1.2rem;
  width: 4rem;
  padding: 0.4rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 8px;
}

.unit-select {
  font-size: 1rem;
  padding: 0.4rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 8px;
}

.slider-value {
  text-align: center;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.vertical-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  font-size: 1.5rem;
  font-weight: bold;
}

.horizontal-slider {
  width: 100%;
  height: 32px;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.primary {
  background: #007AFF;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
}

.secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
}

.marks-list {
  margin-top: 1rem;
}

.mark-card {
  display: flex;
  align-items: center;
  background: var(--color-background-soft);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mark-content {
  display: flex;
  flex: 1;
  gap: 1rem;
}

.mark-distance {
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 4rem;
}

.mark-details {
  flex: 1;
  color: var(--color-text);
  line-height: 1.4;
}

.star-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--color-text);
}

.estimated-mark {
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  text-align: center;
}

.estimate-result {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.unit-radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.unit-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.unit-radio input[type="radio"] {
  margin-right: 0.5rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  outline: none;
  transition: all 0.2s ease;
}

.unit-radio input[type="radio"]:checked {
  border: 6px solid var(--color-highlight, #4CAF50);
  background-color: var(--color-background);
}

.radio-label {
  font-size: 1rem;
}
</style>
