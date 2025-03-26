<script setup>
import { computed } from "vue";
import { getRoundDetails, formatRoundName } from "@/domain/round_details";
import { useHistoryStore } from "@/stores/history";

const props = defineProps({
  round: {
    type: Object,
    required: true
  }
});

const historyStore = useHistoryStore();

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
            <div v-for="(info, index) in roundDetails.distanceInfo" :key="index" class="distance-row">
              <span class="distance-chip" :class="roundDetails.colorScheme">{{ info.distance }}</span>
              <span class="dozens">{{ info.dozens }} dozen</span>
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
  align-items: center;
}

.distance-chip {
  font-weight: 500;
  margin-right: 0.75em;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-size: 0.85em;
  min-width: 50px;
  text-align: center;
}

.dozens {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
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
</style>
