<script setup>
import { computed } from "vue";

const props = defineProps({
  availableClassifications: {
    required: true
  },
  arrowsRemaining: {
    required: true
  },
  maxPossibleScore: {
    required: true
  }
});

const shootInProgress = computed(() => props.arrowsRemaining > 0);
</script>

<template>
  <div class="classification-table-container">
    <div class="table-header">
      <div class="header-cell class-cell">Classification</div>
      <div class="header-cell score-cell">Required score</div>
      <div v-if="shootInProgress" class="header-cell avg-cell">Avg. per end</div>
    </div>

    <div class="table-body">
      <div v-for="(classification, index) in availableClassifications" :key="index+'class'"
           :class="['table-row', {
             'achieved': classification.achieved,
             'failed': classification.score > maxPossibleScore && shootInProgress
           }]">
        <div class="body-cell class-cell">
          <span v-if="classification.achieved" class="achieved-icon">✅</span>
          <span class="classification-badge" :class="classification.name">{{ classification.name }}</span>
        </div>
        <div class="body-cell score-cell">
          {{ classification.score }}
          <span class="short" v-if="classification.shortBy">(-{{ classification.shortBy }})</span>
        </div>
        <div v-if="shootInProgress" class="body-cell avg-cell">
          {{ classification.scorePerEnd }}
          <span class="avgOnTrack" v-if="classification.perEndDiff >= 0">(+{{ classification.perEndDiff }})</span>
          <span class="avgOffTrack" v-if="classification.perEndDiff < 0">({{ classification.perEndDiff }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.classification-table-container {
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  background-color: var(--color-background-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  background-color: var(--color-background-mute);
  padding: 0.75em 1em;
  font-weight: 600;
  font-size: 0.9em;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: flex;
  padding: 0.75em 1em;
  border-top: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(var(--color-background-mute-rgb), 0.5);
}

.header-cell, .body-cell {
  flex: 1;
}

.class-cell {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.score-cell {
  flex: 1;
}

.avg-cell {
  flex: 1;
}

.classification-badge {
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 600;
  text-align: center;
  min-width: 2.5em;
}

.achieved {
  background-color: rgba(144, 238, 144, 0.1);
}

.achieved-icon {
  font-size: 1.1em;
}

.failed {
  text-decoration: line-through;
  opacity: 0.7;
}

.avgOnTrack {
  color: green;
  margin-left: 0.3em;
}

.short, .avgOffTrack {
  color: red;
  margin-left: 0.3em;
}

/* Table footer for remaining arrows and max score */
.table-footer {
  background-color: var(--color-background-mute);
  padding: 0.5em 1em;
  border-top: 1px solid var(--color-border);
}

.footer-row {
  display: flex;
  justify-content: space-between;
  padding: 0.3em 0;
}

.footer-label {
  font-weight: 500;
}

.footer-value {
  font-weight: 600;
}

/* Classification colors matching HistoryCard.vue */
.B1 {
  background-color: hsl(3, 84%, 36%);
  color: white;
}

.B2 {
  background-color: hsl(3, 84%, 46%);
  color: white;
}

.B3 {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

.A3 {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
}

.A2 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

.A1 {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
  color: white;
}
</style>
