<template>
  <HistoryTipModal v-if="showTip" @close="dismissTip" />
  <div class="fullpage" @touchstart="handleTouchStart"
       @touchend="handleTouchEnd">

    <!-- Graph modal -->
    <div v-if="showGraph" class="graph-modal">
      <div class="graph-modal-content">
        <button class="close-graph" @click="showGraph = false">✕</button>
        <ScoreHistoryGraph :historyData="graphData" :isHandicapGraph="isHandicapGraph" />
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

      <div v-if="showGraphButton" class="graph-button-container">
        <button class="view-graph-button" @click="openGraph">
          📈 View {{ capitalizedRoundName }} Graph
        </button>
      </div>

      <div v-if="showHandicapGraphButton" class="graph-button-container">
        <button class="view-graph-button" @click="openHandicapGraph">
          📉 View Handicap Progress
        </button>
      </div>

      <table>
        <thead>
        <tr>
          <th>Date</th>
          <th>Round</th>
          <th colspan="3">Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in filteredHistory" :key="`${item.id}-${item.date}-${item.gameType}-${item.score}`">
          <td @click="view(item.id)">{{ parseAndRenderDate(item.date) }}</td>
          <td @click="view(item.id)">{{ item.gameType }}</td>
          <td @click="view(item.id)" :class="{highlight: item.topScore}">{{ item.score }}</td>
          <td :class="[item.classification?.name, item.classification?.scheme]" @click="view(item.id)">
            {{ item.classification?.name }}
          </td>
          <td @click="view(item.id)">{{ item.handicap }}</td>
        </tr>
        </tbody>
      </table>
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

const store = useHistoryStore();
const router = useRouter();
const user = useUserStore();
const notesStore = useNotesStore();
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

watchEffect(async () => {
  filteredHistory.value = await store.getFilteredHistory({
    pbOnly: pbFilterActive.value,
    round: roundFilter.value,
    dateRange: dateFilter.value,
    classification: classificationFilter.value
  }, user.user);
});

const capitalizedRoundName = computed(() => {
  if (!roundFilter.value) return "";

  // Split the round name by spaces
  return roundFilter.value
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const entriesWithHandicap = computed(() => {
  return filteredHistory.value.filter(item =>
    item.handicap !== undefined &&
    item.handicap !== null &&
    item.handicap !== ""
  );
});

const showHandicapGraphButton = computed(() => {
  // Only show if no round filter is active and we have enough handicap entries
  return !roundFilterActive.value && entriesWithHandicap.value.length >= 5;
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

// Function to open the handicap graph
function openHandicapGraph() {
  // Use only entries with valid handicap values
  graphData.value = entriesWithHandicap.value;
  isHandicapGraph.value = true;
  showGraph.value = true;
}

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

.B3, .B2, .B1, .A3, .A2, .A1, .MB, .GMB, .EMB {
  text-align: center;
  font-weight: bold;
  color: white;
}

.Frostbite {
  color: cornflowerblue;
  font-weight: bold;
}

.B1 {
  background-color: hsl(3, 84%, 36%);
}

.B2 {
  background-color: hsl(3, 84%, 46%);
}

.B3 {
  background-color: hsl(3, 84%, 56%);
}

.A3 {
  background-color: hsl(207, 85%, 90%);
}

.A2 {
  background-color: hsl(207, 85%, 80%);
}

.A1 {
  background-color: hsl(207, 85%, 72%);
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
}

.A1, .A2, .A3 {
  color: #061345;
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

.graph-button-container {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.view-graph-button {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
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
</style>
