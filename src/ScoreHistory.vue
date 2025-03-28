<template>
  <HistoryTipModal v-if="showTip" @close="dismissTip" />
  <div class="fullpage" @touchstart="handleTouchStart"
       @touchend="handleTouchEnd">

    <div v-if="showGraph" class="graph-modal">
      <div class="graph-modal-content">
        <button class="close-graph" @click="showGraph = false">✕</button>
        <ScoreHistoryGraph
          :historyData="graphData"
          :isHandicapGraph="isHandicapGraph"
          :graphTitle="graphTitle"
        />
      </div>
    </div>

    <div v-if="!isDiaryMode">
      <HistoryFilters
        :pb-filter-active="pbFilterActive"
        :round-filter-active="roundFilterActive"
        :date-filter-active="dateFilterActive"
        :classification-filter-active="classificationFilterActive"
        :available-rounds="availableRounds"
        @toggle-pb="handlePBToggle"
        @filter-round="handleRoundFilter"
        @filter-date="handleDateFilter"
        @filter-classification="handleClassificationFilter"
        @reset="handleReset"
      />

      <!-- Replace the existing round graph button section with this -->
      <div v-if="showGraphButton" class="graph-button-container">
        <BaseButton
          variant="default"
          size="medium"
          @click="openGraph"
          fullWidth
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
            <line x1="2" y1="20" x2="22" y2="20"></line>
          </svg>
          <span>View {{ capitalizedRoundName }} Graph</span>
        </BaseButton>
      </div>
      <div v-if="showIndoorHandicapGraphButton || showOutdoorHandicapGraphButton"
           class="graph-button-container handicap-buttons">
        <BaseButton
          v-if="showIndoorHandicapGraphButton"
          variant="default"
          size="medium"
          @click="openIndoorHandicapGraph"
          class="handicap-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Indoor Handicap</span>
        </BaseButton>

        <BaseButton
          v-if="showOutdoorHandicapGraphButton"
          variant="default"
          size="medium"
          @click="openOutdoorHandicapGraph"
          class="handicap-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Outdoor Handicap</span>
        </BaseButton>
      </div>
      <div v-if="hasClassificationProgress" class="classification-progress-section">
        <div v-for="(bowProgress, bowType) in classificationProgress" :key="bowType">
          <!-- In the template, update the ClassificationProgress components -->
          <ClassificationProgress
            v-if="bowProgress.indoor.dozenArrowsRequired > 0"
            :currentClassification="userStore.getIndoorClassification(bowType)"
            :nextClassification="bowProgress.indoor.nextClassification"
            :dozenArrowsShot="bowProgress.indoor.dozenArrowsShot"
            :dozenArrowsRequired="bowProgress.indoor.dozenArrowsRequired"
            environment="indoor"
            :bowType="bowType"
          />

          <ClassificationProgress
            v-if="bowProgress.outdoor.dozenArrowsRequired > 0"
            :currentClassification="userStore.getOutdoorClassification(bowType)"
            :nextClassification="bowProgress.outdoor.nextClassification"
            :dozenArrowsShot="bowProgress.outdoor.dozenArrowsShot"
            :dozenArrowsRequired="bowProgress.outdoor.dozenArrowsRequired"
            environment="outdoor"
            :bowType="bowType"
          />

        </div>
      </div>

      <div class="history-cards">
        <div
          v-for="item in filteredHistory"
          :key="`${item.id}-${item.date}-${item.gameType}-${item.score}`"
          @click="view(item.id)"
        >
          <HistoryCard :item="item" />
        </div>
      </div>
      <p>You have recorded {{ totalArrows }} arrows shot!</p>
    </div>

    <div v-else class="diary-view">
      <article v-for="shoot in shootsWithNotes"
               :key="shoot.id"
               class="diary-entry"
               @click="view(shoot.id)">
        <header>
          <time>{{ parseAndRenderDate(shoot.date) }}</time>
          <h2>
            {{ shoot.gameType.charAt(0).toUpperCase() + shoot.gameType.slice(1) }}
            <span v-if="shoot.classification"
                  :class="[shoot.classification.name, shoot.classification.scheme, 'classLabel']">
      {{ shoot.classification.name }} - {{ shoot.score }}
    </span>
          </h2>
        </header>
        <UserNotes :shootId="shoot.id" />
      </article>
    </div>
  </div>
</template>

<script setup>
import HistoryCard from "@/components/HistoryCard.vue";
import { calculateAllClassificationProgress } from "@/domain/scoring/classification_progress.js";
import { gameTypeConfig } from "@/domain/scoring/game_types.js";
import { ref, watchEffect, computed } from "vue";
import UserNotes from "@/components/UserNotes.vue";
import { useHistoryStore } from "@/stores/history";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";
import HistoryFilters from "@/components/HistoryFilters.vue";
import { usePreferencesStore } from "@/stores/preferences";
import HistoryTipModal from "@/components/modals/HistoryTipModal.vue";
import ScoreHistoryGraph from "@/components/ScoreHistoryGraph.vue";
import ClassificationProgress from "@/components/ClassificationProgress.vue";
import BaseButton from "@/components/BaseButton.vue";

const store = useHistoryStore();
const router = useRouter();
const user = useUserStore();
const notesStore = useNotesStore();
const userStore = useUserStore();
const preferences = usePreferencesStore();

const isDiaryMode = ref(false);
const roundFilter = ref("");
const roundFilterActive = computed(() => roundFilter.value !== "");
const dateFilter = ref({ startDate: "", endDate: "" });
const dateFilterActive = computed(() => Boolean(dateFilter.value.startDate || dateFilter.value.endDate));
const classificationFilter = ref("");
const classificationFilterActive = computed(() => Boolean(classificationFilter.value));
const pbFilterActive = ref(false);
const startX = ref(0);
const availableRounds = computed(() => store.getAvailableRounds());
const showTip = ref(!preferences.hasSeenHistoryTip);

// Graph related state
const showGraph = ref(false);
const graphData = ref([]);
const isHandicapGraph = ref(false);

const filteredHistory = ref([]);

// Get bow types used by the archer
const bowTypesUsed = computed(() => {
  return store.getBowTypesUsed();
});

// Calculate classification progress for all bow types
const classificationProgress = computed(() => {
  return calculateAllClassificationProgress(
    filteredHistory.value,
    userStore.user.indoorClassifications || {},
    userStore.user.outdoorClassifications || {},
    userStore.user.indoorSeasonStartDate,
    userStore.user.outdoorSeasonStartDate,
    bowTypesUsed.value
  );
});

// Check if there's any progress to show
const hasClassificationProgress = computed(() => {
  if (!classificationProgress.value) return false;

  for (const bowType in classificationProgress.value) {
    const progress = classificationProgress.value[bowType];
    if (progress.indoor.dozenArrowsRequired > 0 || progress.outdoor.dozenArrowsRequired > 0) {
      return true;
    }
  }

  return false;
});

watchEffect(async () => {
  filteredHistory.value = await store.getFilteredHistory({
    pbOnly: pbFilterActive.value,
    round: roundFilter.value,
    dateRange: dateFilter.value,
    classification: classificationFilter.value
  }, user.user);
});

// Add these computed properties
const indoorEntriesWithHandicap = computed(() => {
  return filteredHistory.value.filter(item =>
    item.handicap !== undefined &&
    item.handicap !== null &&
    item.handicap !== "" &&
    !gameTypeConfig[item.gameType.toLowerCase()]?.isOutdoor // Check if it's an indoor round
  );
});

const outdoorEntriesWithHandicap = computed(() => {
  return filteredHistory.value.filter(item =>
    item.handicap !== undefined &&
    item.handicap !== null &&
    item.handicap !== "" &&
    gameTypeConfig[item.gameType.toLowerCase()]?.isOutdoor // Check if it's an outdoor round
  );
});

// Update the existing computed property
const showIndoorHandicapGraphButton = computed(() => {
  // Only show if no round filter is active and we have enough indoor handicap entries
  return !roundFilterActive.value && indoorEntriesWithHandicap.value.length >= 5;
});

// Add a new computed property for outdoor
const showOutdoorHandicapGraphButton = computed(() => {
  // Only show if no round filter is active and we have enough outdoor handicap entries
  return !roundFilterActive.value && outdoorEntriesWithHandicap.value.length >= 5;
});


const capitalizedRoundName = computed(() => {
  if (!roundFilter.value) return "";

  // Split the round name by spaces
  return roundFilter.value
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

// Computed property to determine if we should show the graph button
const showGraphButton = computed(() => {
  if (!roundFilterActive.value) return false;

  // Count entries of the selected round type
  const roundEntries = filteredHistory.value.filter(
    item => item.gameType.toLowerCase() === roundFilter.value.toLowerCase()
  );

  return roundEntries.length > 5;
});

// Function to open the graph
function openGraph() {
  // Filter data for the selected round type
  graphData.value = filteredHistory.value.filter(
    item => item.gameType.toLowerCase() === roundFilter.value.toLowerCase()
  );
  isHandicapGraph.value = false;
  showGraph.value = true;
}

function openIndoorHandicapGraph() {
  // Use only indoor entries with valid handicap values
  graphData.value = indoorEntriesWithHandicap.value;
  isHandicapGraph.value = true;
  graphTitle.value = "Indoor Handicap Progress";
  showGraph.value = true;
}

function openOutdoorHandicapGraph() {
  // Use only outdoor entries with valid handicap values
  graphData.value = outdoorEntriesWithHandicap.value;
  isHandicapGraph.value = true;
  graphTitle.value = "Outdoor Handicap Progress";
  showGraph.value = true;
}

const graphTitle = ref("");
const totalArrows = computed(() => store.totalArrows());
const shootsWithNotes = computed(() => filteredHistory.value.filter(shoot => notesStore.getNotesByShootId(shoot.id).length > 0));

function handleClassificationFilter(classification) {
  classificationFilter.value = classification;
}

function handleDateFilter(dates) {
  dateFilter.value = dates;
}

function handleRoundFilter(round) {
  roundFilter.value = round;
}

function handlePBToggle() {
  pbFilterActive.value = !pbFilterActive.value;
}

function handleTouchStart(e) {
  startX.value = e.touches[0].screenX;
}

function handleReset() {
  pbFilterActive.value = false;
  roundFilter.value = "";
  dateFilter.value = { startDate: "", endDate: "" };
  classificationFilter.value = "";
}

function dismissTip() {
  preferences.dismissHistoryTip();
  showTip.value = false;
}

function handleTouchEnd(e) {
  const endX = e.changedTouches[0].screenX;
  const swipeDistance = endX - startX.value;
  const swipeThreshold = 50;


  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0 && isDiaryMode.value) {
      isDiaryMode.value = false; // Swipe right to table
    } else if (swipeDistance < 0 && !isDiaryMode.value && shootsWithNotes.value.length > 0) {
      isDiaryMode.value = true; // Swipe left to diary
    }
  }
}

const dateFormat = {
  day: "numeric",
  month: "numeric",
  year: "numeric"
};

function parseAndRenderDate(date) {
  return new Date(date).toLocaleDateString("en-GB", dateFormat);
}

function view(id) {
  router.push({ name: "viewHistory", params: { id } });
}
</script>
<style scoped>
td {
  text-transform: capitalize;
}

p {
  text-align: center;
}

.diary-entry:first-child {
  margin-top: 0;
}

.diary-entry {
  margin: 1rem;
  padding: 1rem 0.5rem 0 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.diary-entry time {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.diary-entry h2 {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.5;
}

.diary-entry :deep(.notes-container) {
  padding: 0;
}

.diary-entry :deep(.note-row) {
  border-bottom: none;
}

.classLabel {
  font-size: 1rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  margin-left: 0.5rem;
}

.fullpage {
  padding: 0 0.5em; /* Add consistent horizontal padding */
}

.button-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.5em;
}

.graph-button-container {
  display: flex;
  justify-content: center;
  margin: 0;
  width: 100%; /* Full width of parent */
}

.graph-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.graph-modal-content {
  background-color: var(--color-background);
  width: 95%;
  height: 90%;
  border-radius: 8px;
  position: relative;
  padding: 10px;
}

.close-graph {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  color: var(--color-text);
}

.handicap-buttons {
  display: flex;
  gap: 0.5em;
}

.handicap-button {
  flex: 1;
}

.classification-progress-section {
  margin: 0; /* Remove vertical margin */
  border: none; /* Remove border */
  background-color: transparent; /* Make background transparent */
}

/* Add new card styles */
.history-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin: 1em 0;
}
</style>
