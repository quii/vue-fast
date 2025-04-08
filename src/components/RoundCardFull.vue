<script setup>
import { canEstimateSightMark, estimateSightMark } from "@/domain/sight_marks/estimation.js";
import { computed } from "vue";
import { useSightMarksStore } from "@/stores/sight_marks";
import { Distance } from "@/domain/distance/distance";

const props = defineProps({
  formattedName: {
    type: String,
    required: true
  },
  roundDetails: {
    type: Object,
    required: true
  },
  totalArrows: {
    type: Number,
    required: true
  },
  personalBest: {
    type: [Number, String],
    default: null
  },
  hasPB: {
    type: Boolean,
    default: false
  }
});

const sightMarksStore = useSightMarksStore();

// Get all sight marks for estimation
const allSightMarks = computed(() => {
  return sightMarksStore.getMarks();
});

// Helper function to create a proper Distance object from a mark
function createDistanceFromMark(mark) {
  // Check if the distance is already a Distance object
  if (typeof mark.distance === "object" && mark.distance.toMeters) {
    return mark.distance;
  }

  // Convert legacy format to Distance object
  const unit = mark.unit === "m" ? "meters" : "yards";
  return unit === "meters"
    ? Distance.meters(mark.distance)
    : Distance.yards(mark.distance);
}

// Convert all sight marks to the format expected by the estimation functions
const domainSightMarks = computed(() => {
  return allSightMarks.value.map(mark => ({
    distance: createDistanceFromMark(mark),
    notches: mark.notches,
    vertical: mark.vertical
  }));
});

// Check if we can estimate sight marks
const canEstimate = computed(() => {
  return canEstimateSightMark(domainSightMarks.value);
});

// Get sight marks for each distance in the round
const distanceInfoWithSightMarks = computed(() => {
  if (!props.roundDetails || !props.roundDetails.distanceInfo) {
    return [];
  }

  return props.roundDetails.distanceInfo.map(info => {
    // Extract the numeric part and unit from the distance string
    const match = info.distance.match(/(\d+)(yd|m)/);
    if (!match) return { ...info, sightMarks: [], estimatedMarks: [] };

    const [, distanceValue, unitShort] = match;
    const distanceNumber = parseInt(distanceValue);
    const unit = unitShort === "m" ? "meters" : "yards";

    // Find sight marks for this distance
    let sightMarks = [];
    if (unit === "yards") {
      sightMarks = sightMarksStore.findMarksForDistance(null, distanceNumber);
    } else {
      sightMarks = sightMarksStore.findMarksForDistance(distanceNumber, null);
    }

    // If no sight marks found and we can estimate, add an estimated mark
    let estimatedMarks = [];
    if (sightMarks.length === 0 && canEstimate.value) {
      // Create a Distance object for estimation
      const targetDistance = unit === "meters"
        ? Distance.meters(distanceNumber)
        : Distance.yards(distanceNumber);

      const estimatedMark = estimateSightMark(
        domainSightMarks.value,
        targetDistance
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
  <div class="card-content">
    <div class="card-main">
      <div class="card-info">
        <div class="card-header">
          <h3 class="round-name">{{ formattedName }}</h3>
          <div class="badge-container">
            <span class="round-badge" :class="roundDetails.colorScheme">{{ roundDetails.roundType }}</span>
            <span class="venue-badge" :class="roundDetails.venueType.toLowerCase()">{{ roundDetails.venueType }}</span>
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
        <div class="total-arrows">{{ totalArrows }}</div>
        <div class="arrows-label">arrows</div>

        <!-- Personal Best section -->
        <div v-if="hasPB" class="pb-container">
          <div class="pb-score">{{ personalBest }}</div>
          <div class="pb-label">PB</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  gap: 0.5em;
}

.total-arrows {
  font-size: 1.5em;
  font-weight: 700;
}

.arrows-label {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  margin-bottom: 0.25em;
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

.metric.distance-chip {
  background-color: hsla(3, 84%, 65%, 0.2);
  border: 1px solid hsla(3, 84%, 65%, 0.5);
  color: var(--color-text);
}

.metric.round-badge {
  background-color: hsla(3, 84%, 65%, 0.8);
  color: #fff;
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
