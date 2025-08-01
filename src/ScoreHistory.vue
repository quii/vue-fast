<template>
  <HistoryTipModal v-if="showTip" @close="dismissTip" />
  <ManualScoreEntryModal
    :visible="showManualEntryModal"
    :initialDate="today"
    :initialStatus="DEFAULT_SHOOT_STATUS"
    :selectedRound="selectedManualRound"
    @save="handleSaveManualScore"
    @cancel="showManualEntryModal = false"
    @selectRound="openRoundSelectionForManualEntry"
  />
  <div class="fullpage">
    <UnifiedGraphModal
      :visible="showGraph"
      :title="graphTitle"
      :chart-data="chartData"
      :chart-options="chartOptions"
      :chart-type="chartType"
      :no-data-message="noDataMessage"
      :no-data-hint="noDataHint"
      :enable-share="true"
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
      <!-- Actions section -->
      <HistoryActions
        :showRoundGraph="showGraphButton"
        :showIndoorHandicapGraph="showIndoorHandicapGraphButton"
        :showOutdoorHandicapGraph="showOutdoorHandicapGraphButton"
        :showArrowsGraph="showArrowsGraphButton"
        :roundName="capitalizedRoundName"
        @addManualScore="openManualEntryModal"
        @openRoundGraph="openGraph"
        @openIndoorHandicapGraph="openIndoorHandicapGraph"
        @openOutdoorHandicapGraph="openOutdoorHandicapGraph"
        @openArrowsGraph="openArrowsGraph"
      />

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
          @delete="promptDelete"
        />
      </div>
    </div>

    <DeleteConfirmationModal
      :itemName="deleteItemName"
      :visible="showDeleteConfirm"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  </div>
</template>

<script setup>
import ClassificationProgress from "@/components/ClassificationProgress.vue";
import HistoryCard from "@/components/HistoryCard.vue";
import HistoryFilters from "@/components/HistoryFilters.vue";
import GraphIcon from "@/components/icons/GraphIcon.vue";
import HistoryTipModal from "@/components/modals/HistoryTipModal.vue";
import UnifiedGraphModal from "@/components/UnifiedGraphModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import ManualScoreEntryModal from "@/components/modals/ManualScoreEntryModal.vue";
import { DEFAULT_SHOOT_STATUS } from '@/domain/shoot/shoot_status.js';
import { calculateAllClassificationProgress } from "@/domain/scoring/classification_progress.js";
import { roundConfigManager } from "@/domain/scoring/game_types.js";
import { formatRoundName } from "@/domain/scoring/round/formatting.js";
import { useHistoryStore } from "@/stores/history";
import { usePreferencesStore } from "@/stores/preferences";
import { useUserStore } from "@/stores/user";
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HistoryActions from '@/components/HistoryActions.vue'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal.vue'

const store = useHistoryStore();
const router = useRouter();
const route = useRoute() // Add this to access route parameters
const user = useUserStore();
const userStore = useUserStore();
const preferences = usePreferencesStore();

// Initialize filter states from URL query parameters
const roundFilter = ref(route.query.round || '')
const roundFilterActive = computed(() => roundFilter.value !== "");

const dateFilter = ref({
  startDate: route.query.startDate || '',
  endDate: route.query.endDate || ''
})
const dateFilterActive = computed(() => Boolean(dateFilter.value.startDate || dateFilter.value.endDate));

const classificationFilter = ref(route.query.classification || '')
const classificationFilterActive = computed(() => Boolean(classificationFilter.value));

const pbFilterActive = ref(route.query.pbOnly === 'true')
const statusFilter = ref(route.query.status || null)
const statusFilterActive = computed(() => statusFilter.value !== null);

const availableRounds = computed(() => store.getAvailableRounds());
const showTip = ref(!preferences.hasSeenHistoryTip);

// Graph related state
const showGraph = ref(false);
const graphData = ref([]);
const isHandicapGraph = ref(false);
const isArrowsGraph = ref(false); // New state for arrows graph

const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)

// Computed properties for unified graph modal
const chartType = computed(() => {
  return isArrowsGraph.value ? 'bar' : 'line';
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const chartData = computed(() => {
  if (!graphData.value || graphData.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Sort the history data by date (oldest first)
  const sortedData = [...graphData.value].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (isArrowsGraph.value) {
    return {
      labels: sortedData.map(item => formatDate(item.date)),
      datasets: [
        {
          label: 'Arrows per Session',
          data: sortedData.map(item => item.arrowCount),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          type: 'bar'
        },
        {
          label: 'Cumulative Arrows',
          data: sortedData.map(item => item.cumulativeArrows),
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
          type: 'line',
          tension: 0.5,
          yAxisID: 'y1'
        }
      ]
    };
  } else if (isHandicapGraph.value) {
    return {
      labels: sortedData.map(item => formatDate(item.date)),
      datasets: [{
        label: 'Handicap',
        data: sortedData.map(item => item.handicap),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
        tension: 0.5
      }]
    };
  } else {
    // Regular score graph
    return {
      labels: sortedData.map(item => formatDate(item.date)),
      datasets: [{
        label: 'Score',
        data: sortedData.map(item => item.score),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false,
        tension: 0.3
      }]
    };
  }
});

// Helper functions for chart options
const isPortraitOrientation = () => {
  return window.innerHeight > window.innerWidth;
};

const getMaxYValue = (data, property) => {
  if (!data || data.length === 0) return 100;
  return Math.max(...data.map(item => item[property] || 0)) * 1.1; // Add 10% headroom
};

const getMinYValue = (data, property) => {
  if (!data || data.length === 0) return 0;
  const min = Math.min(...data.map(item => item[property] || 0));
  return Math.max(0, min * 0.9); // Subtract 10% but don't go below 0
};

const calculateTickSpacing = (min, max) => {
  const range = max - min;

  // For portrait orientation, use fewer ticks
  if (isPortraitOrientation()) {
    if (range > 500) return Math.ceil(range / 5 / 100) * 100;
    if (range > 200) return Math.ceil(range / 5 / 50) * 50;
    if (range > 100) return Math.ceil(range / 5 / 20) * 20;
    if (range > 50) return 10;
    return 5;
  } else {
    // For landscape, we can use more ticks
    if (range > 500) return Math.ceil(range / 10 / 50) * 50;
    if (range > 200) return Math.ceil(range / 10 / 20) * 20;
    if (range > 100) return Math.ceil(range / 10 / 10) * 10;
    if (range > 50) return 5;
    return 2;
  }
};

const chartOptions = computed(() => {
  // Base options that apply to all chart types
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: isPortraitOrientation() ? 30 : 20,
        bottom: 10,
        left: isPortraitOrientation() ? 15 : 20
      }
    },
    plugins: {
      legend: {
        position: isPortraitOrientation() ? 'top' : 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: isPortraitOrientation() ? 10 : 12
          }
        }
      }
    }
  };

  if (isArrowsGraph.value) {
    // Calculate appropriate tick spacing for arrows graph
    const maxArrowsPerSession = getMaxYValue(graphData.value, 'arrowCount');
    const maxCumulativeArrows = getMaxYValue(graphData.value, 'cumulativeArrows');

    const arrowsTickSpacing = calculateTickSpacing(0, maxArrowsPerSession);
    const cumulativeTickSpacing = calculateTickSpacing(0, maxCumulativeArrows);

    return {
      ...baseOptions,
      scales: {
        y: {
          suggestedMax: maxArrowsPerSession,
          ticks: {
            stepSize: arrowsTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Arrows per Session',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          suggestedMax: maxCumulativeArrows,
          ticks: {
            stepSize: cumulativeTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Total Arrows',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: isPortraitOrientation() ? 45 : 0,
            font: {
              size: isPortraitOrientation() ? 8 : 10
            }
          },
          title: {
            display: true,
            text: 'Date',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = graphData.value[tooltipItems[0].dataIndex];
              return `${formatDate(item.date)} - ${item.gameType}`;
            },
            label: function(context) {
              const item = graphData.value[context.dataIndex];
              if (context.datasetIndex === 0) {
                return `Arrows: ${item.arrowCount}`;
              } else {
                return `Total Arrows: ${item.cumulativeArrows}`;
              }
            }
          }
        }
      }
    };
  } else if (isHandicapGraph.value) {
    // Calculate appropriate tick spacing for handicap graph
    const minHandicap = getMinYValue(graphData.value, 'handicap');
    const maxHandicap = getMaxYValue(graphData.value, 'handicap');
    const handicapTickSpacing = calculateTickSpacing(minHandicap, maxHandicap);

    return {
      ...baseOptions,
      scales: {
        y: {
          ticks: {
            stepSize: handicapTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Handicap (lower is better)',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: isPortraitOrientation() ? 45 : 0,
            font: {
              size: isPortraitOrientation() ? 8 : 10
            }
          },
          title: {
            display: true,
            text: 'Date',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = graphData.value[tooltipItems[0].dataIndex];
              return `${formatDate(item.date)} - ${item.gameType}`;
            },
            label: function(context) {
              const item = graphData.value[context.dataIndex];
              return `Handicap: ${item.handicap}`;
            }
          }
        }
      }
    };
  } else {
    // Calculate appropriate tick spacing for score graph
    const minScore = getMinYValue(graphData.value, 'score');
    const maxScore = getMaxYValue(graphData.value, 'score');
    const scoreTickSpacing = calculateTickSpacing(minScore, maxScore);

    return {
      ...baseOptions,
      scales: {
        y: {
          suggestedMin: minScore,
          suggestedMax: maxScore,
          ticks: {
            stepSize: scoreTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Score',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: isPortraitOrientation() ? 45 : 0,
            font: {
              size: isPortraitOrientation() ? 8 : 10
            }
          },
          title: {
            display: true,
            text: 'Date',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = graphData.value[tooltipItems[0].dataIndex];
              return `${formatDate(item.date)} - ${item.gameType}`;
            },
            label: function(context) {
              const item = graphData.value[context.dataIndex];
              return `Score: ${item.score}`;
            }
          }
        }
      }
    };
  }
});

const noDataMessage = computed(() => {
  if (isArrowsGraph.value) return 'No arrow data available to display.';
  if (isHandicapGraph.value) return 'No handicap data available to display.';
  return 'No score data available to display.';
});

const noDataHint = computed(() => {
  if (isArrowsGraph.value) return 'Arrow data will appear as you complete shoots.';
  if (isHandicapGraph.value) return 'Handicap data will appear when handicaps are calculated.';
  return 'Score data will appear as you complete shoots.';
});

const deleteItemName = computed(() => {
  if (!itemToDelete.value) return "this score";

  // Find the item in the filtered history
  const item = filteredHistory.value.find(i => i.id === itemToDelete.value);
  if (!item) return "this score";

  // Create a descriptive name for the item
  return `the ${formatRoundName(item.gameType)} score of ${item.score}`;
});


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

// New computed property to determine if we should show the arrows graph button
const showArrowsGraphButton = computed(() => {
  // Show the button if we have at least 2 entries with arrow data
  const entriesWithArrows = filteredHistory.value.filter(item => {
    if (!item.scores) return false;

    // Handle both flat arrays and arrays of arrays
    if (Array.isArray(item.scores[0])) {
      return item.scores.flat().length > 0;
    }
    return item.scores.length > 0;
  });

  return entriesWithArrows.length >= 2;
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
  isArrowsGraph.value = false;
  graphTitle.value = `${capitalizedRoundName.value} Scores`;
  showGraph.value = true;
}

function openIndoorHandicapGraph() {
  // Use only indoor entries with valid handicap values
  graphData.value = indoorEntriesWithHandicap.value;
  isHandicapGraph.value = true;
  isArrowsGraph.value = false;
  graphTitle.value = "Indoor Handicap Progress";
  showGraph.value = true;
}

function openOutdoorHandicapGraph() {
  // Use only outdoor entries with valid handicap values
  graphData.value = outdoorEntriesWithHandicap.value;
  isHandicapGraph.value = true;
  isArrowsGraph.value = false;
  graphTitle.value = "Outdoor Handicap Progress";
  showGraph.value = true;
}

// New function to open the arrows shot graph
function openArrowsGraph() {
  // Prepare data for the arrows graph
  const arrowsData = prepareArrowsGraphData(filteredHistory.value);

  // Make sure we're setting the data correctly
  graphData.value = arrowsData;
  isHandicapGraph.value = false;
  isArrowsGraph.value = true;
  graphTitle.value = "Arrows Shot Over Time";
  showGraph.value = true;
}

// Function to prepare data for the arrows graph
function prepareArrowsGraphData(historyItems) {
  // Sort by date (oldest first)
  const sortedItems = [...historyItems].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Create a new array with cumulative arrow counts
  let cumulativeArrows = 0;
  return sortedItems.map(item => {
    // Safely access the scores array
    let arrowCount = 0;

    if (item.scores) {
      // If scores is an array of arrays (like for ends), flatten it
      if (Array.isArray(item.scores[0])) {
        arrowCount = item.scores.flat().length;
      } else {
        // Otherwise just count the array elements
        arrowCount = item.scores.length;
      }
    }

    cumulativeArrows += arrowCount;

    return {
      id: item.id,
      date: item.date,
      arrowCount: arrowCount,
      cumulativeArrows: cumulativeArrows,
      gameType: item.gameType
    };
  });
}

function promptDelete(id) {
  itemToDelete.value = id;
  showDeleteConfirm.value = true;
}

function cancelDelete() {
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

async function confirmDelete() {
  if (!itemToDelete.value) return

  try {
    await store.remove(itemToDelete.value)
  } catch (error) {
    console.error('Failed to delete score:', error)
  } finally {
    showDeleteConfirm.value = false
    itemToDelete.value = null
  }
}

const graphTitle = ref("");
const totalArrows = computed(() => store.totalArrows());

// Function to update URL with current filter state
function updateUrlWithFilters() {
  const query = {}

  if (roundFilter.value) query.round = roundFilter.value
  if (dateFilter.value.startDate) query.startDate = dateFilter.value.startDate
  if (dateFilter.value.endDate) query.endDate = dateFilter.value.endDate
  if (classificationFilter.value) query.classification = classificationFilter.value
  if (pbFilterActive.value) query.pbOnly = 'true'
  if (statusFilter.value) query.status = statusFilter.value

  // Replace the current route with updated query parameters
  router.replace({
    path: route.path,
    query
  })
}

// Watch for changes in filter states and update URL
watch([roundFilter, dateFilter, classificationFilter, pbFilterActive, statusFilter],
  () => {
    updateUrlWithFilters()
  },
  { deep: true }
)

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

const showManualEntryModal = ref(false);
const showRoundSelectionForManualEntry = ref(false);
const selectedManualRound = ref("");
const today = new Date().toISOString().substr(0, 10);

async function handleSaveManualScore(data) {
  try {
    // Create a shoot object with the manual score
    const id = await store.add(
      data.date,
      data.score,
      data.gameType,
      [], // No individual arrow scores
      roundConfigManager.getRound(data.gameType).unit,
      user.user,
      data.shootStatus
    );

    showManualEntryModal.value = false;
    selectedManualRound.value = "";
    toast.success("Manual score saved to history");

    // Optionally refresh filters or navigate to the new entry
    // router.push(`/history/${id}`);
  } catch (error) {
    console.error(error);
    toast.error("Error saving manual score");
  }
}

function openManualEntryModal() {
  showManualEntryModal.value = true;
}

function openRoundSelectionForManualEntry() {
  showManualEntryModal.value = false;
  showRoundSelectionForManualEntry.value = true;
  // Navigate to round selection page with a return parameter
  router.push({
    path: '/select-round',
    query: {
      returnTo: 'history',
      manualEntry: 'true'
    }
  });
}

// Handle round selection from the round selection page
watch(() => route.query.selectedRound, (newRound) => {
  if (newRound && route.query.manualEntry === 'true') {
    selectedManualRound.value = newRound;
    showManualEntryModal.value = true;
    // Clear the query parameters
    router.replace({
      path: '/history',
      query: {}
    });
  }
}, { immediate: true });
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

.arrows-button {
  margin-top: 0.25rem;
}

.manual-entry-button-group {
  margin-bottom: 1rem;
}

.button-icon {
  margin-right: 0.5rem;
}
</style>
