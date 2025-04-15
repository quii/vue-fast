<script setup>

import { formatRoundName } from "@/domain/scoring/round/formatting.js";

defineProps({
  item: {
    type: Object,
    required: true
  }
});

function parseAndRenderDate(date) {
  const dateFormat = {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  };
  return new Date(date).toLocaleDateString("en-GB", dateFormat);
}
</script>
<template>
  <div class="history-card">
    <div
      v-if="item.classification?.name"
      :class="['classification-indicator', item.classification.name, item.classification.scheme]"
    >
      <span class="classification-name" data-test="classification">{{ item.classification.name }}</span>
    </div>
    <div class="card-content">
      <div class="card-main">
        <div class="card-info">
          <h3 class="round-name" data-test="round-name">{{ formatRoundName(item.gameType) }}</h3>
          <div class="card-details">
            <span class="card-date">{{ parseAndRenderDate(item.date) }}</span>
            <span v-if="item.averagePerEnd" class="average-score">{{ item.averagePerEnd }} / end</span>
          </div>
        </div>
        <div class="score-container">
          <div :class="['card-score', {'highlight': item.topScore}]" data-test="score">{{ item.score }}</div>
          <div v-if="item.handicap" class="handicap">HC: {{ item.handicap }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.history-card:active {
  transform: scale(0.98);
}

.classification-indicator {
  width: 30px; /* Wider to fit text */
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
  padding: 0.5em 0;
}

.classification-name {
  font-weight: bold;
  font-size: 0.85em;
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
  align-items: flex-start; /* Changed from center to flex-start to align tops */
}

.card-info {
  display: flex;
  flex-direction: column;
}

.round-name {
  margin: 0;
  font-size: 1.3em; /* Increased from 1.1em to 1.3em */
  font-weight: 600;
}

.card-details {
  display: flex;
  justify-content: space-between; /* This pushes items to opposite ends */
  align-items: center;
  width: 100%;
  margin-top: 0.2em;
  gap: 1em; /* Add explicit gap between items */
}

.card-date {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
}

.average-score {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-weight: 500; /* Slightly bolder than the date */
  margin-left: auto; /* Push to the right */
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center the score and handicap */
  gap: 0.2em; /* Small gap between score and handicap */
}

.card-score {
  font-size: 1.3em;
  font-weight: 700;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

.card-score.highlight {
  background-color: rgba(255, 215, 0, 0.2);
  color: var(--color-text);
}

.handicap {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-style: italic;
}

/* Classification colors */
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

.Frostbite {
  color: cornflowerblue;
  font-weight: bold;
}
</style>
