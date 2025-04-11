<script setup>
import EditIcon from "@/components/icons/EditIcon.vue";
import ViewOnlyTargetFace from "@/components/scoring/ViewOnlyTargetFace.vue";
import {formatRoundName} from "@/domain/formatting.js";
import { getAllShootStatuses, getShootStatusDisplayName } from "@/domain/shoot/shoot_status.js";
import {useRoute, useRouter} from "vue-router";
import {useHistoryStore} from "@/stores/history";
import {gameTypeConfig} from "@/domain/scoring/game_types";
import {computed, ref} from "vue";
import RoundScores from "@/components/RoundScores.vue";
import {useUserStore} from "@/stores/user";
import TipModal from "@/components/modals/TipModal.vue";
import UserNotes from "@/components/UserNotes.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";
import {usePreferencesStore} from "@/stores/preferences";
import {useArrowHistoryStore} from "@/stores/arrow_history";
import PrintModal from "@/components/modals/PrintModal.vue";
import BaseCard from "@/components/BaseCard.vue";
// Update the import path for BaseButton
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";
import ClassificationIcon from "@/components/icons/ClassificationIcon.vue";
import SaveIcon from "@/components/icons/SaveIcon.vue";
import ClearIcon from "@/components/icons/ClearIcon.vue"; // Reuse this for Delete
import {createClassificationCalculator} from "@/domain/scoring/classification";
import {calculateSubtotals} from "@/domain/scoring/subtotals";
import {calculateAverageScorePerEnd} from "@/domain/scoring/distance_totals";

const preferences = usePreferencesStore();
const arrowHistoryStore = useArrowHistoryStore();
const arrows = computed(() => arrowHistoryStore.getArrowsForShoot(route.params.id));

const showPrintModal = ref(false);
const showTip = ref(!preferences.hasSeenPrintTip);
const showDeleteConfirmation = ref(false);
const showClassificationDetails = ref(false);

function dismissTip() {
  preferences.dismissPrintTip();
  showTip.value = false;
}

const route = useRoute();
const router = useRouter();
const history = useHistoryStore();
const userStore = useUserStore();

const showEditModal = ref(false);
const editedStatus = ref(null);
const editedDate = ref("");

history.setShootToView(route.params.id);

const endSize = computed(() => gameTypeConfig[history.selectedShoot.gameType].endSize);
const scores = computed(() => history.selectedShoot.scores);
const gameType = computed(() => history.selectedShoot.gameType);
const date = computed(() => history.selectedShoot.date);
const status = computed(() => getShootStatusDisplayName(history.selectedShoot.shootStatus));

const formattedDate = computed(() => {
  if (!date.value) return "";

  // Format as dd/mm/yy instead of the full date
  const dateObj = new Date(date.value);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear().toString().slice(-2); // Get last 2 digits of year

  return `${day}/${month}/${year}`;
});

const capitalizedGameType = computed(() => formatRoundName(gameType.value));

// Calculate classification data
const classificationCalculator = ref(null);
const availableClassifications = ref(null);
const totals = computed(() => calculateSubtotals(scores.value, gameType.value));
const averageScoresPerEnd = computed(() =>
    calculateAverageScorePerEnd(scores.value, endSize.value, gameType.value)
);

// Since this is a completed shoot, arrows remaining is 0
const arrowsRemaining = computed(() => 0);
// Max possible score is the same as the total score for a completed shoot
const maxPossibleScore = computed(() => totals.value?.totalScore || 0);

// Initialize classification calculator
async function initClassificationCalculator() {
  if (!history.selectedShoot?.userProfile) return;

  const {gender, ageGroup, bowType} = history.selectedShoot.userProfile;

  if (!gender || !ageGroup || !bowType) return;

  classificationCalculator.value = await createClassificationCalculator(
      gameType.value,
      gender,
      ageGroup,
      bowType,
      null // No personal best needed for this calculation
  );

  if (classificationCalculator.value) {
    availableClassifications.value = classificationCalculator.value(
        totals.value?.totalScore || 0,
        averageScoresPerEnd.value
    );
  }
}

// Call the initialization function
initClassificationCalculator();

function confirmDelete() {
  showDeleteConfirmation.value = true;
}

function deleteShoot() {
  history.remove(history.selectedShoot.id);
  router.push("/history");
  showDeleteConfirmation.value = false;
}

function cancelDelete() {
  showDeleteConfirmation.value = false;
}

function handlePrintClick() {
  showPrintModal.value = true;
}

// Prepare info displays for the top bar
const infoDisplays = computed(() => [
  {
    value: capitalizedGameType.value,
    label: "Round",
    class: "wide"
  },
  {
    value: formattedDate.value,
    label: "Date",
    class: "wide"
  }
]);

// Prepare action buttons for the top bar
const actionButtons = computed(() => [
  {
    iconComponent: ClassificationIcon,
    label: "Class",
    action: "toggle-expand",
    active: showClassificationDetails.value,
    disabled: !availableClassifications.value
  },
  {
    iconComponent: EditIcon,
    label: "Edit",
    action: "edit"
  },
  {
    iconComponent: SaveIcon,
    label: "Save",
    action: "save"
  },
  {
    iconComponent: ClearIcon, // Reusing ClearIcon for Delete
    label: "Delete",
    action: "delete",
    variant: "danger"
  }
]);

function handleAction(actionData) {
  if (actionData.action === "delete") {
    confirmDelete();
  } else if (actionData.action === "save") {
    handlePrintClick();
  } else if (actionData.action === "toggle-expand") {
    showClassificationDetails.value = !showClassificationDetails.value;
  } else if (actionData.action === "edit") {
    openEditModal();
  }
}

function openEditModal() {
  // Initialize with current values
  editedStatus.value = history.selectedShoot.shootStatus || "Practice";
  editedDate.value = history.selectedShoot.date || new Date().toISOString().substr(0, 10);
  showEditModal.value = true;
}

function saveEditedShoot() {
  // Validate the date
  if (!editedDate.value) {
    toast.error("Please enter a valid date");
    return;
  }

  // Update the shoot with both status and date
  const success = history.updateShoot(history.selectedShoot.id, {
    shootStatus: editedStatus.value,
    date: editedDate.value
  });

  if (success) {
    // Refresh the selected shoot data
    history.setShootToView(history.selectedShoot.id);
    showEditModal.value = false;
    toast.success("Shoot updated successfully");
  } else {
    toast.error("Failed to update shoot");
  }
}

function cancelEdit() {
  showEditModal.value = false;
}
</script>

<template>
  <div class="page">
    <BaseTopBar
        :info-displays="infoDisplays"
        :action-buttons="actionButtons"
        :has-expandable-content="!!availableClassifications"
        alignment="right"
        @action="handleAction"
    >
      <template #expandable-content>
        <ClassificationDetailsTable
            v-if="availableClassifications"
            :max-possible-score="maxPossibleScore"
            :arrows-remaining="arrowsRemaining"
            :available-classifications="availableClassifications"
        />
      </template>
    </BaseTopBar>

      <BaseCard>
        <ArcherDetails
            :name="userStore.user.name"
            :age-group="history.selectedShoot.userProfile.ageGroup"
            :gender="history.selectedShoot.userProfile.gender"
            :bow-type="history.selectedShoot.userProfile.bowType"
            :status="status"
        />
      </BaseCard>

      <ViewOnlyTargetFace
          v-if="arrows.length > 0"
          :arrows="arrows"
          :valid-scores="gameTypeConfig[gameType].scores"
          :game-type="gameType"
          :knock-color="userStore.user.knockColor"
      />
      <RoundScores
          :scores="scores"
          :end-size="endSize"
          :user-profile="history.selectedShoot.userProfile"
          :game-type="gameType"
      />

      <UserNotes :shoot-id="history.selectedShoot.id" :allow-highlight="true"/>

    <TipModal v-if="showTip" @close="dismissTip"/>
    <PrintModal
        v-if="showPrintModal"
        :shoot="history.selectedShoot"
        :archer-name="userStore.user.name"
        :age-group="userStore.user.ageGroup"
        :gender="userStore.user.gender"
        :bow-type="userStore.user.bowType"
        :end-size="endSize"
        :game-type="gameType"
        :date="date"
        @close="showPrintModal = false"
    />

    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal-content">
        <h3>Delete this shoot?</h3>
        <p>Are you sure you want to delete this shoot? This action cannot be undone.</p>
        <div class="confirmation-actions">
          <BaseButton
              variant="danger"
              @click="deleteShoot">
            Yes, delete this shoot
          </BaseButton>
          <BaseButton
              variant="outline"
              @click="cancelDelete">
            Cancel
          </BaseButton>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showEditModal" class="modal-overlay">
    <div class="modal-content">
      <h3>Edit Shoot</h3>

      <div class="edit-section">
        <h4>Date:</h4>
        <div class="date-input-container">
          <input
            type="date"
            v-model="editedDate"
            class="date-input"
          >
        </div>
      </div>

      <div class="edit-section">
        <h4>Shoot Status:</h4>
        <div class="radio-group">
          <div
            v-for="status in getAllShootStatuses()"
            :key="status"
            class="radio-option"
          >
            <input
              type="radio"
              :id="`status-${status}`"
              :value="status"
              v-model="editedStatus"
              :name="'edit-shoot-status'"
            >
            <label :for="`status-${status}`">{{ getShootStatusDisplayName(status) }}</label>
          </div>
        </div>
      </div>

      <div class="confirmation-actions">
        <BaseButton
          variant="primary"
          @click="saveEditedShoot">
          Save Changes
        </BaseButton>
        <BaseButton
          variant="outline"
          @click="cancelEdit">
          Cancel
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 0.5rem;
}
.signatures p {
  padding-top: 5em;
}

.signatures input {
  height: 1.8em;
  padding-left: 1em;
  border: none;
}

/* Modal Styles */
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

.edit-section {
  margin: 1.5em 0;
}

.edit-section h4 {
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
</style>
