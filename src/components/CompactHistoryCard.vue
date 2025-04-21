<script setup>
import { formatDateContextually } from '@/domain/scoring/round/formatting.js'

defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="compact-history-card">
    <div
      v-if="item.classification?.name"
      :class="['classification-indicator', item.classification.name, item.classification.scheme]"
    >
      <span class="classification-name">{{ item.classification.name }}</span>
    </div>
    <div class="card-content">
      <div class="card-main">
        <div class="card-info">
          <div class="card-details">
            <span class="card-date">{{ formatDateContextually(item.date) }}</span>
          </div>
        </div>
        <div class="score-container">
          <div :class="['card-score', {'highlight': item.topScore}]">{{ item.score }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Compact version of HistoryCard */
.compact-history-card {
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 40px;
}

.classification-indicator {
  width: 25px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
  padding: 0.4em 0;
}

.classification-name {
  font-weight: bold;
  font-size: 0.8em;
}

.card-content {
  flex-grow: 1;
  padding: 0.4em 0.6em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-details {
  display: flex;
  align-items: center;
}

.card-date {
  font-size: 0.8em;
  color: var(--color-text-light, #666);
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-score {
  font-size: 1.1em;
  font-weight: 700;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

.card-score.highlight {
  background-color: rgba(255, 215, 0, 0.2);
  color: var(--color-text);
}

/* Classification colors - copied from HistoryCard.vue */
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