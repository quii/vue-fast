<script setup>
import { computed } from "vue";
import { getNextClassification } from "@/domain/scoring/classificationList";

const props = defineProps({
  currentClassification: {
    type: String,
    required: true
  },
  arrowsShot: {
    type: Number,
    required: true
  },
  arrowsRequired: {
    type: Number,
    required: true
  },
  environment: {
    type: String,
    required: true,
    validator: (value) => ["indoor", "outdoor"].includes(value)
  },
  bowType: {
    type: String,
    required: true
  }
});

const nextClassification = computed(() => {
  return getNextClassification(props.currentClassification);
});

const progressPercentage = computed(() => {
  if (props.arrowsRequired === 0) return 0;
  const percentage = (props.arrowsShot / props.arrowsRequired) * 100;
  return Math.min(percentage, 100);
});

const arrowsRemaining = computed(() => {
  return Math.max(0, props.arrowsRequired - props.arrowsShot);
});

const environmentLabel = computed(() => {
  return props.environment.charAt(0).toUpperCase() + props.environment.slice(1);
});

const bowTypeLabel = computed(() => {
  return props.bowType.charAt(0).toUpperCase() + props.bowType.slice(1);
});
</script>

<template>
  <div class="classification-progress">
    <div class="progress-header">
      <h3>{{ environmentLabel }} {{ bowTypeLabel }} Classification Progress</h3>
      <div class="classification-info">
        <span class="current-classification">{{ currentClassification }}</span>
        <span class="arrow">→</span>
        <span class="next-classification">{{ nextClassification }}</span>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
    </div>

    <div class="progress-details">
      <span>{{ arrowsShot }} of {{ arrowsRequired }} arrows ({{ arrowsRemaining }} remaining)</span>
      <span>{{ Math.round(progressPercentage) }}% complete</span>
    </div>
  </div>
</template>

<style scoped>
.classification-progress {
  margin: 1em 0;
  padding: 1em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
}

.progress-header h3 {
  margin: 0;
  font-size: 1.1em;
}

.classification-info {
