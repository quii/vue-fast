<script setup>
import ViewOnlyTargetFace from "@/components/scoring/ViewOnlyTargetFace.vue";
import { useRoute, useRouter } from "vue-router";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig } from "@/domain/scoring/game_types";
import { computed, ref } from "vue";
import RoundScores from "@/components/RoundScores.vue";
import { useUserStore } from "@/stores/user";
import TipModal from "@/components/modals/TipModal.vue";
import UserNotes from "@/components/UserNotes.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";
import { usePreferencesStore } from "@/stores/preferences";
import { useArrowHistoryStore } from "@/stores/arrow_history";
import PrintModal from "@/components/modals/PrintModal.vue";
import BaseCard from "@/components/BaseCard.vue";
// Update the import path for BaseButton
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";
import { createClassificationCalculator } from "@/domain/scoring/classification";
import { calculateSubtotals } from "@/domain/scoring/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/scoring/distance_totals";

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

history.setShootToView(route.params.id);

const endSize = computed(() => gameTypeConfig[history.selectedShoot.gameType].endSize);
const scores = computed(() => history.selectedShoot.scores);
const gameType = computed(() => history.selectedShoot.gameType);
const date = computed(() => history.selectedShoot.date);

// Format the date for display
const formattedDate = computed(() => {
  if (!date.value) return "";
  return new Date(date.value).toLocaleDateString();
});

// Capitalize the game type for display
const capitalizedGameType = computed(() => {
  if (!gameType.value) return "";
  return gameType.value.charAt(0).toUpperCase() + gameType.value.slice(1);
});

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

  const { gender, ageGroup, bowType } = history.selectedShoot.userProfile;

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
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="6"></circle>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
          </svg>`,
    label: "Class",
    action: "toggle-expand",
    active: showClassificationDetails.value,
    disabled: !availableClassifications.value
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>`,
    label: "Save",
    action: "save"
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>`,
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
    // Just toggle the state, the computed property will update automatically
    showClassificationDetails.value = !showClassificationDetails.value;
  }
}
</script>

<template>
  <!-- Top Bar using BaseTopBar component -->
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

  <!-- Content Container with proper padding -->
  <div class="content-container">
    <BaseCard>
      <div id="scores">
        <ArcherDetails
          :name="userStore.user.name"
          :age-group="history.selectedShoot.userProfile.ageGroup"
          :gender="history.selectedShoot.userProfile.gender"
          :bow-type="history.selectedShoot.userProfile.bowType"
        />
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
      </div>
    </BaseCard>

    <UserNotes :shoot-id="history.selectedShoot.id" :allow-highlight="true" />
  </div>

  <TipModal v-if="showTip" @close="dismissTip" />
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
</template>

<style scoped>
.signatures p {
  padding-top: 5em;
}

.signatures input {
  height: 1.8em;
  padding-left: 1em;
  border: none;
}

/* Content Container - Added for proper padding */
.content-container {
  padding: 0 0.5rem;
  max-width: 800px;
  margin: 0 auto;
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
</style>
