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
import BaseButton from "@/components/ui/BaseButton.vue";

const preferences = usePreferencesStore();
const arrowHistoryStore = useArrowHistoryStore();
const arrows = computed(() => arrowHistoryStore.getArrowsForShoot(route.params.id));

const showPrintModal = ref(false);
const showTip = ref(!preferences.hasSeenPrintTip);
const showDeleteConfirmation = ref(false);

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
</script>

<template>
  <!-- Top Bar -->
  <div class="top-bar-container">
    <div class="filters-container">
      <div class="filters">
        <!-- Round Name Display (non-interactive) -->
        <div class="info-display round-info">
          <div class="info-value round-name">{{ capitalizedGameType }}</div>
          <div class="info-label">Round</div>
        </div>

        <!-- Date Display (non-interactive) -->
        <div class="info-display date-info">
          <div class="info-value date-value">{{ formattedDate }}</div>
          <div class="info-label">Date</div>
        </div>

        <div class="spacer"></div>

        <!-- Save Score Sheet Button -->
        <button
          class="filter-button"
          @click="handlePrintClick"
          data-test="view-shoot-save"
          aria-label="Save score sheet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span class="filter-label">Save</span>
        </button>

        <!-- Delete Shoot Button -->
        <button
          class="filter-button delete-button"
          @click="confirmDelete"
          aria-label="Delete shoot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span class="filter-label">Delete</span>
        </button>
      </div>
    </div>
  </div>

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

/* Top Bar Styles - Based on TopBar.vue */
.top-bar-container {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border-light);
}

.filters-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin: 0.5em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters {
  display: flex;
  padding: 0.75em 0.5em;
  align-items: center;
  gap: 0.5rem;
}

.spacer {
  flex-grow: 1;
}

.filter-button, .info-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--color-background);
  border: none;
  color: var(--color-text-light);
  transition: all 0.2s ease;
  padding: 0.5em;
}

.info-display {
  background-color: var(--color-background-mute);
  cursor: default;
}

.round-info, .date-info {
  width: 120px; /* Double the width */
  padding: 0.5em;
}

.info-display .round-name {
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.info-display .date-value {
  font-size: 0.95em; /* Smaller font size for date */
  white-space: nowrap;
}

.filter-button {
  cursor: pointer;
}

.filter-button:active {
  transform: scale(0.95);
}

.filter-button.delete-button {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.filter-button.delete-button:active {
  background-color: rgba(220, 53, 69, 0.2);
}

.filter-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 0.25em;
}

.filter-label {
  font-size: 0.7em;
  font-weight: 500;
  text-align: center;
  line-height: 1;
  margin-bottom: 0.3em;
}

.info-value {
  font-size: 1.2em;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
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

@media (min-width: 768px) {
  .filters {
    gap: 1rem;
  }

  .filter-button {
    width: 70px;
  }

  .round-info, .date-info {
    width: 140px; /* Even wider on larger screens */
  }
}
</style>
