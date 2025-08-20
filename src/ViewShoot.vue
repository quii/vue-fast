<script setup>
import EditIcon from "@/components/icons/EditIcon.vue";
import ShareIcon from '@/components/icons/ShareIcon.vue'
import ViewOnlyTargetFace from "@/components/scoring/ViewOnlyTargetFace.vue";
import { getShootStatusDisplayName } from "@/domain/shoot/shoot_status.js";
import {useRoute, useRouter} from "vue-router";
import {useHistoryStore} from "@/stores/history";
import { roundConfigManager } from "@/domain/scoring/game_types";
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import RoundScores from "@/components/RoundScores.vue";
import {useUserStore} from "@/stores/user";
import TipModal from "@/components/modals/TipModal.vue";
import UserNotes from "@/components/UserNotes.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";
import {usePreferencesStore} from "@/stores/preferences";
import {useArrowHistoryStore} from "@/stores/arrow_history";
import PrintModal from "@/components/modals/PrintModal.vue";
import BaseCard from "@/components/BaseCard.vue";
import BaseTopBar from "@/components/ui/BaseTopBar.vue";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";
import ClassificationIcon from "@/components/icons/ClassificationIcon.vue";
import ClearIcon from "@/components/icons/ClearIcon.vue"; // Reuse this for Delete
import {createClassificationCalculator} from "@/domain/scoring/classification";
import {calculateSubtotals} from "@/domain/scoring/subtotals";
import {calculateAverageScorePerEnd} from "@/domain/scoring/distance_totals";
import ShootEditModal from "@/components/modals/ShootEditModal.vue";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal.vue";
import EndTotalChart from "@/components/EndTotalChart.vue";
import ScoreDistributionChart from "@/components/ScoreDistributionChart.vue";
import { useAchievementNotifications } from '@/composables/useAchievementNotifications.js';
import AchievementCelebrationModal from '@/components/modals/AchievementCelebrationModal.vue';

const preferences = usePreferencesStore();
const arrowHistoryStore = useArrowHistoryStore();
const route = useRoute()
const router = useRouter()
const history = useHistoryStore()
const userStore = useUserStore()
const achievementNotifications = useAchievementNotifications()

const showPrintModal = ref(false);
const showTip = ref(!preferences.hasSeenPrintTip);
const showDeleteConfirm = ref(false);
const showClassificationDetails = ref(false);

// Achievement tracking - use a Set to track which shoots have already been checked
const achievementsChecked = ref(new Set());

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

// Check achievements only once per shoot visit
async function checkAchievementsOnce() {
  const shootId = parseInt(route.params.id);
  
  // Only check if we haven't already checked for this shoot
  if (!achievementsChecked.value.has(shootId) && shoot.value) {
    achievementsChecked.value.add(shootId);
    
    // Look for unread achievements that were earned by this specific shoot
    const achievementsForThisShoot = achievementNotifications.achievementStore.unreadAchievements.filter(achievement => 
      achievement.achievingShootId === shootId
    );
    
    // Show achievements that were earned by this specific shoot
    achievementNotifications.showAchievementsForShoot(achievementsForThisShoot);
  }
}

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
  showDeleteConfirm.value = true;
}

function deleteShoot() {
  history.remove(shoot.value.id);
  router.push("/history");
  showDeleteConfirm.value = false;
}

function cancelDelete() {
  showDeleteConfirm.value = false;
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

// Achievement handlers
function handleAchievementDismissed() {
  achievementNotifications.dismissCelebrationPopup();
}

function handleDisablePopups() {
  achievementNotifications.disablePopups();
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

const navigationInfo = ref({ previousId: null, nextId: null });
const touchStartX = ref(0);
const touchEndX = ref(0);
const swipeThreshold = 100; // Minimum distance to trigger a swipe

const canNavigatePrevious = computed(() => navigationInfo.value.previousId !== null);
const canNavigateNext = computed(() => navigationInfo.value.nextId !== null);

function loadNavigationInfo() {
  if (shoot.value) {
    navigationInfo.value = history.getNavigationInfo(parseInt(route.params.id));
  }
}

function navigateToPrevious() {
  if (canNavigatePrevious.value) {
    router.push(`/history/${navigationInfo.value.previousId}`);
  }
}

function navigateToNext() {
  if (canNavigateNext.value) {
    router.push(`/history/${navigationInfo.value.nextId}`);
  }
}

function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX;
}

function handleTouchEnd(event) {
  touchEndX.value = event.changedTouches[0].clientX;
  handleSwipe();
}

function handleSwipe() {
  const swipeDistance = touchEndX.value - touchStartX.value;

  // Check if the swipe distance exceeds the threshold
  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0 && canNavigateNext.value) {
      // Swipe right -> go to next (newer) shoot
      navigateToNext();
    } else if (swipeDistance < 0 && canNavigatePrevious.value) {
      // Swipe left -> go to previous (older) shoot
      navigateToPrevious();
    }
  }
}

watch(() => route.params.id, async () => {
  loadNavigationInfo();
  await checkAchievementsOnce();
});

onMounted(async () => {
  loadNavigationInfo();
  await checkAchievementsOnce();
});
</script>

<template>
  <div class="page" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
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
            :handicap="shoot.handicap"
            :classification="shoot.classification"
            :location="shoot.location"
            :shoot-duration="shoot.shootDuration"
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

    <EndTotalChart
        :scores="scores"
        :game-type="roundName"
    />

    <ScoreDistributionChart
        :scores="scores"
        :game-type="roundName"
    />

    <UserNotes :shoot-id="shoot.id" :allow-highlight="true" />

    <TipModal v-if="showTip" @close="dismissTip"/>
    <PrintModal
        v-if="showPrintModal"
        :shoot="shoot"
        :archer-name="userStore.user.name"
        @close="showPrintModal = false"
    />

    <!-- Achievement Celebration Modal -->
    <AchievementCelebrationModal
      v-if="achievementNotifications.shouldShowCelebrationModal.value && achievementNotifications.currentAchievement.value"
      :achievement="achievementNotifications.currentAchievement.value"
      @dismiss="handleAchievementDismissed"
      @disable-popups="handleDisablePopups"
    />

    <!-- Confirmation Modal -->
    <DeleteConfirmationModal
      :visible="showDeleteConfirm"
      :itemName="shoot ? `the ${round.prettyRoundName()} score of ${totals?.totalScore || 0}` : 'this score'"
      @confirm="deleteShoot"
      @cancel="cancelDelete"
    />
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

.navigation-indicators {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 0.5rem;
  opacity: 0.7;
}

.nav-indicator {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  color: var(--color-text-mute);
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.nav-indicator.active {
  color: var(--color-highlight);
}

.nav-arrow {
  font-size: 1.2rem;
  margin: 0 0.3rem;
}

.nav-label {
  display: none;
}

@media (min-width: 768px) {
  .nav-label {
    display: inline;
  }
}
</style>
