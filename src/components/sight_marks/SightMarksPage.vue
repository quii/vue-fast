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
          <div class="estimate-unit-radio-group">
            <label class="estimate-unit-radio">
              <input
                type="radio"
                v-model="estimateUnit"
                value="m"
                name="distance-unit"
              />
              <span class="radio-label">meters</span>
            </label>
            <label class="estimate-unit-radio">
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

    <BaseModal v-if="showAddMark" title="Add Sight Mark">
      <div class="form-group">
        <div class="input-header">
          <label>Label (optional)</label>
          <input
            type="text"
            v-model="newMark.label"
            maxlength="100"
            class="label-input"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="input-header">
          <label>Distance</label>
          <div class="distance-inputs">
            <input type="number" v-model="newMark.distanceValue" class="distance-number" />
            <div class="unit-radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="newMark.distanceUnit" 
                  value="meters"
                  name="distanceUnit"
                />
                <span class="radio-label">m</span>
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="newMark.distanceUnit" 
                  value="yards"
                  name="distanceUnit"
                />
                <span class="radio-label">yd</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Use the new SightMarkInput component -->
      <SightMarkInput v-model="sightMarkValues" />

      <div class="dialog-actions">
        <button class="secondary" @click="showAddMark = false">Cancel</button>
        <button class="primary" @click="saveMark">Save</button>
      </div>
    </BaseModal>

    <!-- Use the DeleteConfirmationModal component -->
    <DeleteConfirmationModal
      :visible="showDeleteConfirm"
      :item-name="markToDelete ? `${markToDelete.distance}${markToDelete.unit}` : ''"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <div class="marks-list">
      <DeleteableCard
        class="mark-card"
        v-for="mark in marks"
        :key="`${mark.distance}${mark.unit}`"
        :indicator="getIndicatorForMark(mark)"
        @click="editMark(mark)"
        @delete="deleteMark(mark)"
      >
        <div class="mark-content">
          <dl class="mark-details">
            <div class="detail-row">
              <dt>Extension</dt>
              <dd>{{ mark.notches }} notches</dd>
            </div>
            <div class="detail-row">
              <dt>Height</dt>
              <dd>{{ formatVertical(mark.vertical) }}</dd>
            </div>
            <div v-if="mark.label" class="detail-row">
              <dt>Label</dt>
              <dd class="mark-label">{{ mark.label }}</dd>
            </div>
          </dl>
          <button
            class="star-button"
            @click.stop="togglePriority(mark)"
          >
            {{ mark.priority ? "⭐" : "☆" }}
          </button>
        </div>
      </DeleteableCard>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSightMarksStore } from "@/stores/sight_marks";
import BaseModal from "@/components/modals/BaseModal.vue";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal.vue";
import NumberSpinner from "@/components/common/NumberSpinner.vue";
import SightMarkInput from "./SightMarkInput.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import DeleteableCard from "@/components/DeleteableCard.vue";
import {
  estimateSightMark,
  canEstimateSightMark,
  SightMark,
  VerticalAdjustment
} from "@/domain/sight_marks/estimation";
import { Distance } from "@/domain/distance/distance";

interface StoreSightMark extends SightMark {
  id: string;
  label?: string;
  priority: boolean;
}

interface NewMarkForm {
  id: string | null;
  distanceValue: number;
  distanceUnit: "meters" | "yards";
  notches: number;
  label: string;
  vertical: VerticalAdjustment;
}

type DistanceUnit = "meters" | "yards";

const store = useSightMarksStore();
const marks = computed<StoreSightMark[]>(() => store.getMarks());

const showAddMark = ref(false);
const showDeleteConfirm = ref(false);
const markToDelete = ref<StoreSightMark | null>(null);

// New refs for the estimate feature
const showEstimateModal = ref(false);
const estimateDistance = ref(30);
const estimateUnit = ref<DistanceUnit>("meters");
const estimatedMark = ref<SightMark | null>(null);
const estimateLabel = ref("");
const showSaveEstimateOptions = ref(false);

// Function to create indicator object for each mark
function getIndicatorForMark(mark: StoreSightMark) {
  return {
    text: `${mark.distance}${mark.unit}`,
    class: mark.priority ? "priority" : ""
  };
}

// Check if we have enough marks to enable estimation
const canEstimate = computed(() => {
  // Convert store marks to domain SightMark objects
  const domainMarks = marks.value.map(storeMark => ({
    distance: createDistanceFromMark(storeMark),
    notches: storeMark.notches,
    vertical: storeMark.vertical
  }));

  return canEstimateSightMark(domainMarks);
});

// Helper function to create Distance objects from store marks
function createDistanceFromMark(mark: StoreSightMark): Distance {
  // Convert legacy unit format if needed
  const unit = mark.unit === "m" ? "meters" : mark.unit === "yd" ? "yards" : mark.unit;
  return unit === "meters" ? Distance.meters(mark.distance) : Distance.yards(mark.distance);
}

// Helper function to format distance for display
const newMark = ref<NewMarkForm>({
  id: null,
  distanceValue: 20,
  distanceUnit: "meters",
  notches: 2,
  label: "",
  vertical: {
    major: 5,
    minor: 6,
    micro: 2
  }
});

// Computed property for the SightMarkInput component
const sightMarkValues = computed({
  get() {
    return {
      notches: newMark.value.notches,
      vertical: newMark.value.vertical
    };
  },
  set(value) {
    newMark.value.notches = value.notches;
    newMark.value.vertical = value.vertical;
  }
});

const notchesValue = computed({
  get() {
    return 15 - newMark.value.notches;
  },
  set(value) {
    newMark.value.notches = 15 - value;
  }
});

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
function handleAction(actionData: { action: string }) {
  if (actionData.action === "add-mark") {
    showAddMark.value = true;
  } else if (actionData.action === "estimate-mark") {
    openEstimateModal();
  }
}

//TODO: this should have to be so complex
function calculateEstimate() {
  // Convert store marks to domain SightMark objects with proper Distance objects
  const domainMarks = marks.value.map(storeMark => {
    // Check if the distance is already a Distance object
    let distance;
    if (typeof storeMark.distance === "object" && storeMark.distance.toMeters) {
      distance = storeMark.distance;
    } else {
      // Convert legacy format to Distance object
      const unit = storeMark.unit === "m" ? "meters" : "yards";
      distance = unit === "meters"
        ? Distance.meters(storeMark.distance)
        : Distance.yards(storeMark.distance);
    }

    return {
      distance,
      notches: storeMark.notches,
      vertical: storeMark.vertical
    };
  });

  // Create a Distance object for the target
  const targetDistance = estimateUnit.value === "meters"
    ? Distance.meters(estimateDistance.value)
    : Distance.yards(estimateDistance.value);

  // Calculate the estimate
  estimatedMark.value = estimateSightMark(
    domainMarks,
    targetDistance
  );

  showSaveEstimateOptions.value = false;
}

function saveEstimatedMark() {
  if (!estimatedMark.value) return;

  // Convert the unit format for the store
  const storeUnit = estimateUnit.value === "meters" ? "m" : "yd";

  store.addMark(
    estimateDistance.value,
    storeUnit,
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

function formatVertical(vertical: VerticalAdjustment): string {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}

function saveMark() {
  const storeUnit = newMark.value.distanceUnit === "meters" ? "m" : "yd";

  const { id, notches, vertical, label, distanceValue } = newMark.value;

  if (id) {
    store.updateMark(id, distanceValue, storeUnit, notches, vertical, label);
  } else {
    store.addMark(distanceValue, storeUnit, notches, vertical, label);
  }
  showAddMark.value = false;
}

function editMark(mark: StoreSightMark) {
  // Convert legacy unit format if needed
  const distanceUnit = mark.unit === "m" ? "meters" : mark.unit === "yd" ? "yards" : mark.unit;

  newMark.value = {
    id: mark.id,
    distanceValue: mark.distance,
    distanceUnit: distanceUnit as DistanceUnit,
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

function deleteMark(mark: StoreSightMark) {
  markToDelete.value = mark;
  showDeleteConfirm.value = true;
}

function confirmDelete() {
  if (markToDelete.value) {
    store.deleteMark(markToDelete.value.id);
    showDeleteConfirm.value = false;
    markToDelete.value = null;
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  markToDelete.value = null;
}

function togglePriority(mark: StoreSightMark) {
  store.togglePriority(mark.distance, mark.unit);
}
</script>

<style scoped>
/* Styles for the definition list with increased gap between label and value */
.mark-details {
  flex: 1;
  margin: 0;
  padding: 0;
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
  align-items: baseline;
  gap: 1rem; /* Add explicit gap between dt and dd */
}

.detail-row:last-child {
  margin-bottom: 0;
}

.mark-details dt {
  width: 5rem; /* Fixed width for labels */
  font-weight: 500;
  color: var(--color-text-light, #666);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0; /* Prevent label from shrinking */
}

.mark-details dd {
  margin: 0;
  flex: 1;
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--color-text);
}

.mark-label {
  font-style: italic;
  opacity: 0.9;
}

.sight-marks {
  padding: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.form-group:last-child {
  border-bottom: none;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem; /* Reduced gap */
  width: 100%;
  min-width: 0;
}

.distance-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: stretch; /* Changed from center to stretch */
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
  flex-wrap: nowrap; /* Prevent wrapping */
}

.form-group label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  flex-shrink: 0;
  text-align: left;
}

.label-input {
  flex: 1;
  font-size: 1rem;
  padding: 0.3rem 0.8rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 6px;
  height: 2.2rem;
  box-sizing: border-box;
  min-width: 0;
}

.distance-number {
  font-size: 1rem;
  width: 3.5rem;
  padding: 0.3rem 0.6rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 6px;
  height: 2.2rem;
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.unit-radio-group {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
  align-items: stretch;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 2.2rem;
  height: 2.2rem;
  box-sizing: border-box;
  justify-content: center;
}

.radio-option:hover {
  background: var(--color-background-mute);
}

.radio-option input[type="radio"] {
  margin: 0;
  accent-color: var(--color-highlight, #007AFF);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.radio-option input[type="radio"]:checked + .radio-label {
  font-weight: 600;
  color: var(--color-highlight, #007AFF);
}

.radio-label {
  font-size: 0.85rem;
  color: var(--color-text);
  user-select: none;
  font-weight: 500;
  white-space: nowrap;
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

.mark-content {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
}

.mark-distance {
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 4rem;
}

.star-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--color-text);
  margin-left: 0.5rem;
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

.estimate-unit-radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.estimate-unit-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.estimate-unit-radio input[type="radio"] {
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

.estimate-unit-radio input[type="radio"]:checked {
  border: 6px solid var(--color-highlight, #4CAF50);
  background-color: var(--color-background);
}

.radio-label {
  font-size: 1rem;
}

/* Custom styles for the indicator in DeleteableCard */
:deep(.mark-card .card-indicator) {
  width: 40px; /* Make the indicator wider */
  background-color: var(--color-background-mute);
}

:deep(.mark-card .indicator-text) {
  font-size: 1.1em; /* Larger text */
  font-weight: 700; /* Bolder text */
}

/* Style for priority marks */
:deep(.mark-card .card-indicator.priority) {
  background-color: rgba(255, 215, 0, 0.2); /* Gold background for priority items */
}

/* Mobile responsive styles */
@media (max-width: 480px) {
  .input-header {
    gap: 0.5rem;
  }
  
  .distance-inputs {
    justify-content: center;
    gap: 0.75rem;
  }
  
  .distance-number {
    width: 4rem;
  }
  
  .unit-radio-group {
    justify-content: center;
    gap: 0.5rem;
  }
  
  .radio-option {
    padding: 0.4rem 0.8rem;
    min-width: 3rem;
  }
}

</style>
