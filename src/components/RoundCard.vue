<script setup>
import { formatRoundName } from "@/domain/formatting.js";
import { canEstimateSightMark, estimateSightMark } from "@/domain/sight_marks/estimation.js";
import { computed } from "vue";
import { getRoundDetails } from "@/domain/round_details";
import { useHistoryStore } from "@/stores/history";
import { useSightMarksStore } from "@/stores/sight_marks";

const props = defineProps({
  round: {
    type: Object,
    required: true
  }
});

const historyStore = useHistoryStore();
const sightMarksStore = useSightMarksStore();

// Get round details from the domain layer
const roundDetails = computed(() => {
  return getRoundDetails(props.round.round);
});

// Format the round name
const formattedName = computed(() => {
  return formatRoundName(props.round.round);
});

// Get the user's personal best for this round
const personalBest = computed(() => {
  return historyStore.personalBest(props.round.round);
});

// Check if the user has a personal best for this round
const hasPB = computed(() => {
  return personalBest.value !== undefined;
});

// Get all sight marks for estimation
const allSightMarks = computed(() => {
  return sightMarksStore.getMarks();
});

// Check if we can estimate sight marks
const canEstimate = computed(() => {
  return canEstimateSightMark(allSightMarks.value);
});

// Get sight marks for each distance in the round
const distanceInfoWithSightMarks = computed(() => {
  if (!roundDetails.value || !roundDetails.value.distanceInfo) {
    return [];
  }

  return roundDetails.value.distanceInfo.map(info => {
    // Extract the numeric part and unit from the distance string
    const match = info.distance.match(/(\d+)(yd|m)/);
    if (!match) return { ...info, sightMarks: [], estimatedMarks: [] };

    const [, distanceValue, unit] = match;
    const distanceNumber = parseInt(distanceValue);

    // Find sight marks for this distance
    let sightMarks = [];
    if (unit === "yd") {
      sightMarks = sightMarksStore.findMarksForDistance(null, distanceNumber);
    } else {
      sightMarks = sightMarksStore.findMarksForDistance(distanceNumber, null);
    }

    // If no sight marks found and we can estimate, add an estimated mark
    let estimatedMarks = [];
    if (sightMarks.length === 0 && canEstimate.value) {
      const estimatedMark = estimateSightMark(
        allSightMarks.value,
        distanceNumber,
        unit
      );

      if (estimatedMark) {
        estimatedMarks = [estimatedMark];
      }
    }

    return {
      ...info,
      sightMarks,
      estimatedMarks
    };
  });
});

// Format the vertical sight mark value
function formatVertical(vertical) {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}
</script>
<template>
  <div v-if="roundDetails" class="round-card">
    <div :class="['card-indicator', roundDetails.colorScheme]">
      <span class="indicator-text">{{ roundDetails.totalDozens }}</span>
      <span class="indicator-label">dozen</span>
    </div>
    <div class="card-content">
      <div class="card-main">
        <div class="card-info">
          <div class="card-header">
            <h3 class="round-name">{{ formattedName }}</h3>
            <div class="badge-container">
              <span class="round-badge" :class="roundDetails.colorScheme">{{ roundDetails.roundType }}</span>
              <span class="venue-badge" :class="roundDetails.venueType.toLowerCase()">{{ roundDetails.venueType
                }}</span>
            </div>
          </div>

          <div class="distance-info">
            <div v-for="(info, index) in distanceInfoWithSightMarks" :key="index" class="distance-row">
              <span class="distance-chip" :class="roundDetails.colorScheme">{{ info.distance }}</span>
              <div class="info-values">
                <div class="info-row">
                  <span class="dozens">{{ info.dozens }} dozen</span>

                  <!-- User's saved sight marks for this distance -->
                  <div v-if="info.sightMarks && info.sightMarks.length > 0" class="sight-marks-inline">
                    <div v-for="(mark, markIndex) in info.sightMarks" :key="mark.id"
                         class="sight-mark-inline"
                         :class="{ 'first-mark': markIndex === 0 }">
                      <span class="sight-mark-emoji">📏</span>
                      <span class="sight-value">{{ formatVertical(mark.vertical) }}</span>
                    </div>
                  </div>

                  <!-- Estimated sight marks for this distance -->
                  <div v-else-if="info.estimatedMarks && info.estimatedMarks.length > 0" class="sight-marks-inline">
                    <div v-for="(mark, markIndex) in info.estimatedMarks" :key="`est-${index}-${markIndex}`"
                         class="sight-mark-inline estimated-mark"
                         :class="{ 'first-mark': markIndex === 0 }">
                      <span class="sight-mark-emoji">📏</span>
                      <span class="sight-value">{{ formatVertical(mark.vertical) }}</span>
                      <span class="estimated-label">(est.)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="arrows-container">
          <div class="total-arrows">{{ roundDetails.totalArrows }}</div>
          <div class="arrows-label">arrows</div>

          <!-- Personal Best section -->
          <div v-if="hasPB" class="pb-container">
            <div class="pb-score">{{ personalBest }}</div>
            <div class="pb-label">PB</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.round-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
  margin-bottom: 0.75em;
}

.round-card:active {
  transform: scale(0.98);
}

.card-indicator {
  width: 50px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75em 0;
}

.indicator-text {
  font-weight: bold;
  font-size: 1.5em;
  line-height: 1;
}

.indicator-label {
  font-size: 0.7em;
  margin-top: 0.2em;
}

.card-content {
  flex-grow: 1;
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-bottom: 0.75em;
}

.round-name {
  margin: 0;
  font-size: 1.3em;
  font-weight: 600;
}

.badge-container {
  display: flex;
  gap: 0.5em;
  align-items: center;
}

.round-badge, .venue-badge {
  padding: 0.2em 0.6em;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
}

.distance-info {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.distance-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5em;
}

.info-values {
  flex-grow: 1;
}

.info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75em;
}

.sight-marks-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.sight-mark-inline {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.first-mark {
  margin-left: 0;
}

.sight-mark-emoji {
  font-size: 0.85em;
}

.sight-value {
  font-weight: 600;
  font-size: 0.85em;
}

.mark-label {
  font-size: 0.75em;
  color: var(--color-text-light);
  font-style: italic;
  margin-left: 0.25em;
}

.distance-chip {
  font-weight: 500;
  margin-right: 0.75em;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-size: 0.85em;
  min-width: 50px;
  text-align: center;
  flex-shrink: 0;
}

.dozens {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  padding-top: 0.15em;
}

.arrows-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5em;
  border-radius: 8px;
  min-width: 70px;
  text-align: center;
  gap: 0.5em; /* Add gap between elements */
}

.total-arrows {
  font-size: 1.5em;
  font-weight: 700;
}

.arrows-label {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  margin-bottom: 0.25em; /* Add space before PB */
}

/* Color schemes that work in both light and dark modes */
.imperial {
  background-color: hsla(207, 85%, 65%, 1);
  color: white;
}

.imperial.distance-chip {
  background-color: hsla(207, 85%, 65%, 0.2);
  border: 1px solid hsla(207, 85%, 65%, 0.5);
  color: var(--color-text);
}

.imperial.round-badge {
  background-color: hsla(207, 85%, 65%, 0.8);
  color: #fff;
}

.metric {
  background-color: hsla(3, 84%, 65%, 1);
  color: white;
}

.metric.distance-chip {
  background-color: hsla(3, 84%, 65%, 0.2);
  border: 1px solid hsla(3, 84%, 65%, 0.5);
  color: var(--color-text);
}

.metric.round-badge {
  background-color: hsla(3, 84%, 65%, 0.8);
  color: #fff;
}

.outdoor {
  background-color: hsla(145, 63%, 42%, 0.8);
  color: white;
}

.indoor {
  background-color: hsla(271, 68%, 32%, 0.8);
  color: white;
}

/* Styles for the personal best */
.pb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.25em;
  padding: 0.25em 0.5em;
  background-color: var(--color-background);
  border-radius: 4px;
  min-width: 50px;
  color: var(--color-text-light, #666);
}

.pb-score {
  font-size: 1.1em;
  font-weight: 700;
}

.pb-label {
  font-size: 0.7em;
  font-weight: 600;
  color: var(--color-text-light, #666);
}

.estimated-mark {
  border: 1px dashed var(--color-border);
  border-radius: 4px;
  padding: 0 0.3em;
  background-color: rgba(var(--color-background-rgb), 0.5);
}

.estimated-label {
  font-size: 0.7em;
  color: var(--color-text-light);
  font-style: italic;
  margin-left: 0.25em;
}
</style>
