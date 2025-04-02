<script setup>
import { computed, ref } from "vue";
import EditClassificationModal from "./modals/EditClassificationModal.vue";

const props = defineProps({
  currentClassification: {
    type: String,
    required: true
  },
  nextClassification: {
    type: String,
    required: true
  },
  dozenArrowsShot: {
    type: Number,
    required: true
  },
  dozenArrowsRequired: {
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

const showEditModal = ref(false);

const progressPercentage = computed(() => {
  if (props.dozenArrowsRequired === 0) return 0;
  const percentage = (props.dozenArrowsShot / props.dozenArrowsRequired) * 100;
  return Math.min(percentage, 100);
});

const dozenArrowsRemaining = computed(() => {
  return Math.max(0, props.dozenArrowsRequired - props.dozenArrowsShot);
});

const environmentLabel = computed(() => {
  return props.environment.charAt(0).toUpperCase() + props.environment.slice(1);
});

const bowTypeLabel = computed(() => {
  return props.bowType.charAt(0).toUpperCase() + props.bowType.slice(1);
});

// Determine the CSS class for the current classification
const currentClassCss = computed(() => {
  return props.currentClassification.replace("/", "");
});

// Determine the CSS class for the next classification
const nextClassCss = computed(() => {
  return props.nextClassification.replace("/", "");
});

function openEditModal() {
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}
</script>

<template>
  <div class="classification-progress" @click="openEditModal">
    <div class="progress-header">
      <h3>{{ environmentLabel }} {{ bowTypeLabel }} Classification</h3>
      <div class="classification-info">
        <span :class="['current-classification', currentClassCss]">{{ currentClassification }}</span>
        <span class="arrow">→</span>
        <span :class="['next-classification', nextClassCss]">{{ nextClassification }}</span>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
    </div>

    <div class="progress-details">
      <span>{{ dozenArrowsShot }} of {{ dozenArrowsRequired }} dozen arrows ({{ dozenArrowsRemaining
        }} dozen remaining)</span>
      <span>{{ Math.round(progressPercentage) }}% complete</span>
    </div>

    <div class="edit-hint">Tap to edit</div>
  </div>

  <!-- Use the separate modal component -->
  <EditClassificationModal
    :show="showEditModal"
    :current-classification="currentClassification"
    :environment="environment"
    :bow-type="bowType"
    @close="closeEditModal"
  />
</template>
<style scoped>
.classification-progress {
  margin: 0.5em 0.5em 1em 0.5em;
  padding: 1em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.classification-progress:hover {
  background-color: var(--color-background-mute);
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
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.current-classification, .next-classification {
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-weight: bold;
}

/* Classification colors - match the ones used in ScoreHistory.vue */
.B3, .B2, .B1 {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

.A3, .A2, .A1 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
  color: white;
}

.Unclassified {
  background-color: #f0f0f0;
  color: #666;
}

.progress-container {
  height: 1.5em;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin: 0.5em 0;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary, #42b883);
  transition: width 0.3s ease;
  position: absolute;
  left: 0;
  top: 0;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: var(--color-text-light, #666);
  margin-bottom: 15px;
}

.arrow {
  font-size: 1.2em;
  color: var(--color-text, #333);
}

.edit-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.8em;
  color: var(--color-text-light);
  opacity: 0.7;
}
</style>
