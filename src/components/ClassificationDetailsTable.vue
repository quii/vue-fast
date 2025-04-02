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
          <span class="classification-badge" :class="classification.name">{{ classification.name }}</span>
          <span v-if="classification.achieved" class="achieved-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </span>
        </div>
        <div class="body-cell score-cell">
          {{ classification.score }}
          <span class="short" v-if="classification.shortBy">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-down">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            {{ classification.shortBy }}
          </span>
        </div>
        <div v-if="shootInProgress" class="body-cell avg-cell">
          {{ classification.scorePerEnd }}
          <span class="avgOnTrack" v-if="classification.perEndDiff >= 0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-up">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            {{ classification.perEndDiff }}
          </span>
          <span class="avgOffTrack" v-if="classification.perEndDiff < 0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-down">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            {{ Math.abs(classification.perEndDiff) }}
          </span>
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  background-color: var(--color-background-mute);
  padding: 0.75em 1em;
  font-weight: 600;
  font-size: 0.9em;
  border-bottom: 1px solid var(--color-border);
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: flex;
  padding: 0.75em 1em;
  border-top: 1px solid var(--color-border-light);
  transition: background-color 0.2s ease;
}

.table-row:first-child {
  border-top: none;
}

.table-row:hover {
  background-color: rgba(var(--color-background-mute-rgb), 0.5);
}

.header-cell, .body-cell {
  flex: 1;
}

.class-cell {
  flex: 1.2;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.score-cell {
  flex: 1;
  display: flex;
  align-items: center;
}

.avg-cell {
  flex: 1;
  display: flex;
  align-items: center;
}

.classification-badge {
  display: inline-block;
  padding: 0.25em 0.7em;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  text-align: center;
  min-width: 2.5em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.achieved {
  background-color: rgba(144, 238, 144, 0.1);
  border-left: 3px solid var(--color-highlight, #4CAF50);
}

.achieved-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--color-highlight, #4CAF50);
  margin-left: 0.3em;
}

.achieved-icon svg {
  width: 100%;
  height: 100%;
}

.failed {
  text-decoration: line-through;
  opacity: 0.7;
}

.avgOnTrack, .avgOffTrack, .short {
  margin-left: 0.3em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.2em;
}

.avgOnTrack {
  color: var(--color-highlight, #4CAF50);
}

.avgOffTrack, .short {
  color: #dc3545;
}

.arrow-up, .arrow-down {
  width: 14px;
  height: 14px;
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
