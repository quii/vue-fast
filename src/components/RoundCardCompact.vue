<script setup>
import { computed } from "vue";

const props = defineProps({
  formattedName: {
    type: String,
    required: true
  },
  roundDetails: {
    type: Object,
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

// Compute formatted distance display without units
const formattedDistances = computed(() => {
  if (props.roundDetails.distanceInfo && props.roundDetails.distanceInfo.length > 0) {
    // Extract just the numeric part from each distance
    const distances = props.roundDetails.distanceInfo.map(info => {
      // Extract just the numeric part using regex
      const match = info.distance.match(/(\d+)/);
      return match ? match[1] : info.distance;
    });

    // Join with spaces
    return distances.join(" ");
  } else {
    // Fallback to max distance
    return props.roundDetails.maxDistance;
  }
});

// Get the unit
const distanceUnit = computed(() => {
  return props.roundDetails.unit || "";
});
</script>

<template>
  <div class="card-content">
    <div class="card-main">
      <div class="card-info">
        <h3 class="round-name">{{ formattedName }}</h3>
      </div>

      <div class="card-right">
        <!-- Personal Best section -->
        <div v-if="hasPB" class="pb-container">
          <div class="pb-score">{{ personalBest }}</div>
          <div class="pb-label">PB</div>
        </div>

        <!-- Distance display with space-separated values and unit below -->
        <div class="distance-container">
          <div class="distance-score">{{ formattedDistances }}</div>
          <div class="distance-label">{{ distanceUnit }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-content {
  flex-grow: 1;
  padding: 0.75em;
  box-sizing: border-box;
  display: flex;
  align-items: center; /* Center content vertically */
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0; /* Remove any margin */
}

.card-info {
  display: flex;
  align-items: center;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 0.75em;
}

.round-name {
  margin: 0; /* Remove default margins */
  font-size: 1.2em;
  font-weight: 600;
  line-height: 1.2; /* Consistent line height */
}

/* Styles for the distance display - matching PB styling */
.distance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically */
  padding: 0.2em 0.4em;
  background-color: var(--color-background);
  border-radius: 4px;
  min-width: 60px;
  color: var(--color-text-light, #666);
  height: 100%; /* Fill available height */
  box-sizing: border-box;
}

.distance-score {
  font-size: 1em;
  font-weight: 700;
  line-height: 1.1; /* Slightly increased for better alignment */
  margin: 0; /* Remove any margin */
}

.distance-label {
  font-size: 0.6em;
  font-weight: 600;
  color: var(--color-text-light, #666);
  line-height: 1.1; /* Consistent line height */
  margin: 0; /* Remove any margin */
}

/* Styles for the personal best */
.pb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically */
  padding: 0.2em 0.4em;
  background-color: var(--color-background);
  border-radius: 4px;
  min-width: 40px;
  color: var(--color-text-light, #666);
  height: 100%; /* Fill available height */
  box-sizing: border-box;
}

.pb-score {
  font-size: 1em;
  font-weight: 700;
  line-height: 1.1; /* Slightly increased for better alignment */
  margin: 0; /* Remove any margin */
}

.pb-label {
  font-size: 0.6em;
  font-weight: 600;
  color: var(--color-text-light, #666);
  line-height: 1.1; /* Consistent line height */
  margin: 0; /* Remove any margin */
}
</style>
