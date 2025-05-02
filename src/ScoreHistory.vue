<template>
  <HistoryTipModal v-if="showTip" @close="dismissTip" />
  <div class="fullpage">
    <ScoreHistoryGraph
      :historyData="graphData"
      :isHandicapGraph="isHandicapGraph"
      :graphTitle="graphTitle"
      :visible="showGraph"
      @close="showGraph = false"
    />

    <div>
      <HistoryFilters
        :pb-filter-active="pbFilterActive"
        :round-filter-active="roundFilterActive"
        :date-filter-active="dateFilterActive"
        :classification-filter-active="classificationFilterActive"
        :status-filter-active="statusFilterActive"
        :current-status="statusFilter"
        :available-rounds="availableRounds"
        @toggle-pb="handlePBToggle"
        @filter-round="handleRoundFilter"
        @filter-date="handleDateFilter"
        @filter-classification="handleClassificationFilter"
        @filter-status="handleStatusFilter"
        @reset="handleReset"
      />

      <ButtonGroup v-if="showGraphButton">
        <BaseButton
          variant="default"
          size="medium"
          @click="openGraph"
          fullWidth
        >
          <GraphIcon />
          <span>View {{ capitalizedRoundName }} Graph</span>
        </BaseButton>
      </ButtonGroup>
      <ButtonGroup v-if="showIndoorHandicapGraphButton || showOutdoorHandicapGraphButton">
        <BaseButton
          v-if="showIndoorHandicapGraphButton"
          variant="default"
          size="medium"
          @click="openIndoorHandicapGraph"
          class="handicap-button"
        >
          <GraphIcon />
          <span>Indoor Handicap</span>
        </BaseButton>

        <BaseButton
          v-if="showOutdoorHandicapGraphButton"
          variant="default"
          size="medium"
          @click="openOutdoorHandicapGraph"
          class="handicap-button"
        >
          <GraphIcon />
          <span>Outdoor Handicap</span>
        </BaseButton>
      </ButtonGroup>
      <div v-if="hasClassificationProgress" class="classification-progress-section">
        <div v-for="(bowProgress, bowType) in classificationProgress" :key="bowType">
          <KeepAlive>
            <ClassificationProgress
            v-if="shouldShowIndoorProgress(bowProgress)"
            :currentClassification="userStore.getIndoorClassification(bowType)"
            :nextClassification="bowProgress.indoor.nextClassification"
            :dozenArrowsShot="bowProgress.indoor.dozenArrowsShot"
            :dozenArrowsRequired="bowProgress.indoor.dozenArrowsRequired"
            environment="indoor"
            :bowType="bowType"
          />
          </KeepAlive>

          <KeepAlive>
          <ClassificationProgress
            v-if="shouldShowOutdoorProgress(bowProgress)"
            :currentClassification="userStore.getOutdoorClassification(bowType)"
            :nextClassification="bowProgress.outdoor.nextClassification"
            :dozenArrowsShot="bowProgress.outdoor.dozenArrowsShot"
            :dozenArrowsRequired="bowProgress.outdoor.dozenArrowsRequired"
            environment="outdoor"
            :bowType="bowType"
          />
          </KeepAlive>
        </div>
      </div>

      <div class="history-cards">
        <HistoryCard
          v-for="item in filteredHistory"
          :key="item.id"
          :item="item"
          @click="view(item.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ClassificationProgress from "@/components/ClassificationProgress.vue";
import HistoryCard from "@/components/HistoryCard.vue";
import HistoryFilters from "@/components/HistoryFilters.vue";
import GraphIcon from "@/components/icons/GraphIcon.vue";
import HistoryTipModal from "@/components/modals/HistoryTipModal.vue";
import ScoreHistoryGraph from "@/components/ScoreHistoryGraph.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { calculateAllClassificationProgress } from "@/domain/scoring/classification_progress.js";
import { roundConfigManager } from "@/domain/scoring/game_types.js";
import { formatRoundName } from "@/domain/scoring/round/formatting.js";
import { useHistoryStore } from "@/stores/history";
import { usePreferencesStore } from "@/stores/preferences";
import { useUserStore } from "@/stores/user";
import { computed, ref } from 'vue'
import { useRouter } from "vue-router";

const store = useHistoryStore();
const router = useRouter();
const user = useUserStore();
const userStore = useUserStore();
const preferences = usePreferencesStore();

const roundFilter = ref("");
const roundFilterActive = computed(() => roundFilter.value !== "");
const dateFilter = ref({ startDate: "", endDate: "" });
const dateFilterActive = computed(() => Boolean(dateFilter.value.startDate || dateFilter.value.endDate));
const classificationFilter = ref("");
const classificationFilterActive = computed(() => Boolean(classificationFilter.value));
const pbFilterActive = ref(false);
const statusFilter = ref(null);
const statusFilterActive = computed(() => statusFilter.value !== null);

const availableRounds = computed(() => store.getAvailableRounds());
const showTip = ref(!preferences.hasSeenHistoryTip);

// Graph related state
const showGraph = ref(false);
const graphData = ref([]);
const isHandicapGraph = ref(false);

const filteredHistory = computed(() => {
  return store.getFilteredHistory({
    pbOnly: pbFilterActive.value,
    round: roundFilter.value,
    dateRange: dateFilter.value,
    classification: classificationFilter.value,
    shootStatus: statusFilter.value
  }, user.user)
})

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

const isIndoorSeasonActive = computed(() => {
  const today = new Date();
  const indoorStartDate = new Date(userStore.user.indoorSeasonStartDate);
  return today >= indoorStartDate;
});

const isOutdoorSeasonActive = computed(() => {
  const today = new Date();
  const outdoorStartDate = new Date(userStore.user.outdoorSeasonStartDate);
  return today >= outdoorStartDate;
});

// Functions to determine if we should show progress
const shouldShowIndoorProgress = (bowProgress) => {
  return bowProgress.indoor.dozenArrowsRequired > 0 && isIndoorSeasonActive.value;
};

const shouldShowOutdoorProgress = (bowProgress) => {
  return bowProgress.outdoor.dozenArrowsRequired > 0 && isOutdoorSeasonActive.value;
};

// Update the hasClassificationProgress computed property to consider season dates
const hasClassificationProgress = computed(() => {
  if (!classificationProgress.value) return false;

  for (const bowType in classificationProgress.value) {
    const progress = classificationProgress.value[bowType];
    if (shouldShowIndoorProgress(progress) || shouldShowOutdoorProgress(progress)) {
      return true;
    }
  }

  return false;
});

const indoorEntriesWithHandicap = computed(() =>
  filteredHistory.value.filter(item =>
    !roundConfigManager.getRound(item.gameType).isOutdoor &&
    item.handicap !== undefined &&
    item.handicap !== null &&
    item.handicap !== ''
  ));

const outdoorEntriesWithHandicap = computed(() =>
  filteredHistory.value.filter(item =>
    roundConfigManager.getRound(item.gameType).isOutdoor &&
    item.handicap !== undefined &&
    item.handicap !== null &&
    item.handicap !== ''
  ));

const showIndoorHandicapGraphButton = computed(() => {
  return !roundFilterActive.value && indoorEntriesWithHandicap.value.length >= 5;
});

const showOutdoorHandicapGraphButton = computed(() => {
  return !roundFilterActive.value && outdoorEntriesWithHandicap.value.length >= 5;
});


const capitalizedRoundName = computed(() => formatRoundName(roundFilter.value));

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

function handleStatusFilter(status) {
  statusFilter.value = status;
}

function handleReset() {
  pbFilterActive.value = false;
  roundFilter.value = "";
  dateFilter.value = { startDate: "", endDate: "" };
  classificationFilter.value = "";
  statusFilter.value = null;
}

function dismissTip() {
  preferences.dismissHistoryTip();
  showTip.value = false;
}

function view(id) {
  router.push({ name: "viewHistory", params: { id } });
}
</script>
<style scoped>

.fullpage {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.classification-progress-section {
  margin: 0.75em 0;
  border: none;
  background-color: transparent;
}

/* Add new card styles */
.history-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.button-group {
  margin-top: 0;
}

.button-group button {
  margin-top: 0.25rem;
}
</style>
