<script setup>
import EditIcon from "@/components/icons/EditIcon.vue";
import ShareIcon from '@/components/icons/ShareIcon.vue'
import ViewOnlyTargetFace from "@/components/scoring/ViewOnlyTargetFace.vue";
import { getShootStatusDisplayName } from "@/domain/shoot/shoot_status.js";
import {useRoute, useRouter} from "vue-router";
import {useHistoryStore} from "@/stores/history";
import { roundConfigManager } from "@/domain/scoring/game_types";
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
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";
import ClassificationIcon from "@/components/icons/ClassificationIcon.vue";
import SaveIcon from "@/components/icons/SaveIcon.vue";
import ClearIcon from "@/components/icons/ClearIcon.vue"; // Reuse this for Delete
import {createClassificationCalculator} from "@/domain/scoring/classification";
import {calculateSubtotals} from "@/domain/scoring/subtotals";
import {calculateAverageScorePerEnd} from "@/domain/scoring/distance_totals";
import ShootEditModal from "@/components/modals/ShootEditModal.vue";

const preferences = usePreferencesStore();
const arrowHistoryStore = useArrowHistoryStore();
const route = useRoute()
const router = useRouter()
const history = useHistoryStore()
const userStore = useUserStore()

const showPrintModal = ref(false);
const showTip = ref(!preferences.hasSeenPrintTip);
const showDeleteConfirmation = ref(false);
const showClassificationDetails = ref(false);

const showEditModal = ref(false);
const editedStatus = ref(null);
const editedDate = ref("");

const shoot = computed(() => history.getById(parseInt(route.params.id)));
const arrows = computed(() => arrowHistoryStore.getArrowsForShoot(route.params.id))
const round = computed(() => roundConfigManager.getRound(shoot.value.gameType));
const roundName = computed(() => round.value.name);
const endSize = computed(() => round.value.endSize);
const scores = computed(() => shoot.value.scores);
const date = computed(() => shoot.value.date);
const status = computed(() => getShootStatusDisplayName(shoot.value.shootStatus));

const formattedDate = computed(() => {
  if (!date.value) return "";

  // Format as dd/mm/yy instead of the full date
  const dateObj = new Date(date.value);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear().toString().slice(-2); // Get last 2 digits of year

  return `${day}/${month}/${year}`;
});

// Calculate classification data
const classificationCalculator = ref(null);
const availableClassifications = ref(null);
const totals = computed(() => calculateSubtotals(scores.value, roundName.value));
const averageScoresPerEnd = computed(() =>
  calculateAverageScorePerEnd(scores.value, endSize.value, roundName.value)
);

// Since this is a completed shoot, arrows remaining is 0
const arrowsRemaining = 0
const maxPossibleScore = computed(() => totals.value?.totalScore || 0);

// Initialize classification calculator
async function initClassificationCalculator() {
  if (!shoot.value?.userProfile) return;

  const { gender, ageGroup, bowType } = shoot.value.userProfile;

  if (!gender || !ageGroup || !bowType) return;

  classificationCalculator.value = await createClassificationCalculator(
    roundName.value,
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

const editShootData = computed(() => {
  if (!shoot) return null;

  // Create classification object similar to ScoreCard.vue
  let classification = null;
  if (availableClassifications.value && availableClassifications.value.length > 0) {
    // Filter to only include achieved classifications and exclude "PB"
    const validClassifications = availableClassifications.value.filter(c =>
      c.achieved && c.name !== "PB"
    );

    if (validClassifications.length > 0) {
      // Get the last item (highest valid classification)
      const highestClassification = validClassifications[validClassifications.length - 1];
      classification = {
        name: highestClassification.name,
        scheme: highestClassification.scheme
      };
    }
  }

  // Make sure we have all the required properties for HistoryCard
  return {
    ...shoot.value,
    // Use our calculated classification instead of the stored one
    classification: classification || shoot.value.classification
  };
});

function dismissTip() {
  preferences.dismissPrintTip()
  showTip.value = false
}

function confirmDelete() {
  showDeleteConfirmation.value = true;
}

function deleteShoot() {
  history.remove(shoot.value.id);
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
    value: round.value.prettyRoundName(),
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
    iconComponent: ShareIcon,
    label: 'Share',
    action: 'share'
  },
  {
    iconComponent: ClearIcon,
    label: "Delete",
    action: "delete",
    variant: "danger"
  }
]);

function handleAction(actionData) {
  if (actionData.action === "delete") {
    confirmDelete();
  } else if (actionData.action === 'share') {
    handlePrintClick();
  } else if (actionData.action === "toggle-expand") {
    showClassificationDetails.value = !showClassificationDetails.value;
  } else if (actionData.action === "edit") {
    openEditModal()
  }
}

function openEditModal() {
  // Initialize with current values
  editedStatus.value = shoot.value.shootStatus || "Practice";
  editedDate.value = shoot.value.date || new Date().toISOString().substr(0, 10);
  showEditModal.value = true;
}
function cancelEdit() {
  showEditModal.value = false;
}

function handleSaveFromModal(data) {
  // Update the shoot with both status and date
  const success = history.updateShoot(shoot.value.id, {
    shootStatus: data.shootStatus,
    date: data.date
  });

  if (success) {
    showEditModal.value = false;
  }
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
            :age-group="shoot.userProfile.ageGroup"
            :gender="shoot.userProfile.gender"
            :bow-type="shoot.userProfile.bowType"
            :status="status"
        />
      </BaseCard>

      <ViewOnlyTargetFace
          v-if="arrows.length > 0"
          :arrows="arrows"
          :valid-scores="round.scores"
          :game-type="roundName"
          :knock-color="userStore.user.knockColor"
      />
      <RoundScores
          :scores="scores"
          :end-size="endSize"
          :user-profile="shoot.userProfile"
          :game-type="roundName"
      />

    <UserNotes :shoot-id="shoot.id" :allow-highlight="true" />

    <TipModal v-if="showTip" @close="dismissTip"/>
    <PrintModal
        v-if="showPrintModal"
        :shoot="shoot"
        :archer-name="userStore.user.name"
        :age-group="userStore.user.ageGroup"
        :gender="userStore.user.gender"
        :bow-type="userStore.user.bowType"
        :end-size="endSize"
        :game-type="roundName"
        :date="date"
        :status="status"
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

  <ShootEditModal
    :visible="showEditModal"
    :shootData="editShootData"
    :isEditMode="true"
    :initialDate="shoot.value?.date"
    :initialStatus="shoot.value?.shootStatus || 'Practice'"
    @save="handleSaveFromModal"
    @cancel="cancelEdit"
  />
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



</style>
