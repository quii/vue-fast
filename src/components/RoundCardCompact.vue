<script setup>
defineProps({
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
</script>

<template>
  <div class="card-content">
    <div class="card-main">
      <div class="card-info">
        <h3 class="round-name">{{ formattedName }}</h3>

        <!-- Personal Best section - moved inline with round name -->
        <div v-if="hasPB" class="pb-container">
          <div class="pb-score">{{ personalBest }}</div>
          <div class="pb-label">PB</div>
        </div>
      </div>

      <!-- Changed to display max distance with label and unit -->
      <div class="distance-container">
        <div class="distance-value">{{ roundDetails.maxDistance }}{{ roundDetails.unit }}</div>
        <div class="distance-details">
          <span class="distance-unit"></span>
          <!-- Only show "max" label if there's more than one distance -->
          <span v-if="roundDetails.distanceInfo && roundDetails.distanceInfo.length > 1"
                class="distance-label">max</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-content {
  flex-grow: 1;
  padding: 0.75em;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 0.75em;
}

.round-name {
  margin: 0;
  font-size: 1.2em;
  font-weight: 600;
}

/* New styles for the distance display */
.distance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 0.4em 0.6em;
  min-width: 60px;
  text-align: center;
}

.distance-value {
  font-size: 1.2em;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text);
}

.distance-details {
  display: flex;
  gap: 0.2em;
  font-size: 0.7em;
  color: var(--color-text-light, #666);
}

.distance-unit {
  font-weight: 500;
}

.distance-label {
  font-weight: 600;
}

/* Styles for the personal best */
.pb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2em 0.4em;
  background-color: var(--color-background);
  border-radius: 4px;
  min-width: 40px;
  color: var(--color-text-light, #666);
}

.pb-score {
  font-size: 1em;
  font-weight: 700;
  line-height: 1;
}

.pb-label {
  font-size: 0.6em;
  font-weight: 600;
  color: var(--color-text-light, #666);
}
</style>
