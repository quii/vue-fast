<script setup>
import { formatRoundName, formatDateContextually } from '@/domain/scoring/round/formatting.js';
import DeleteableCard from '@/components/DeleteableCard.vue';
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click', 'delete']);

// Prepare indicator object for BaseCard
const indicator = computed(() => {
  if (props.item.classification?.name) {
    return {
      text: props.item.classification.name,
      class: `${props.item.classification.name} ${props.item.classification.scheme}`
    };
  }
  return null;
});

function handleDelete() {
  emit('delete', props.item.id);
}

function handleClick() {
  emit('click');
}
</script>

<template>
  <div class="history-card">
    <DeleteableCard
      :class="{'classification-name':true}"
      :indicator="indicator"
      @click="handleClick"
      @delete="handleDelete"
    >
      <div class="card-main">
        <div class="card-info">
          <h3 class="round-name" data-test="round-name">{{ formatRoundName(item.gameType) }}</h3>
          <div class="card-details">
            <span class="card-date">{{ formatDateContextually(item.date) }}</span>
            <span v-if="item.averagePerEnd" class="average-score">{{ item.averagePerEnd }} / end</span>
          </div>
        </div>
        <div class="score-container">
          <div :class="['card-score', {'highlight': item.topScore}]" data-test="score">{{ item.score }}</div>
          <div v-if="item.handicap" class="handicap">HC: {{ item.handicap }}</div>
        </div>
      </div>
    </DeleteableCard>
  </div>
</template>

<style scoped>
/* We can keep the .history-card class empty or add specific styles if needed */
.history-card {
  /* This class is used for test selection */
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.round-name {
  margin: 0;
  font-size: 1.3em;
  font-weight: 600;
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 0.2em;
  gap: 1em;
}

.card-date {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
}

.average-score {
  font-size: 0.85em;
  color: var(--color-text-light, #666);
  font-weight: 500;
  margin-left: auto;
}

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
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

/* Classification colors - using :deep to target the indicator inside BaseCard */
:deep(.card-indicator.B1) {
  background-color: hsl(3, 84%, 36%);
  color: white;
}

:deep(.card-indicator.B2) {
  background-color: hsl(3, 84%, 46%);
  color: white;
}

:deep(.card-indicator.B3) {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

:deep(.card-indicator.A3) {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
}

:deep(.card-indicator.A2) {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

:deep(.card-indicator.A1) {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
}

:deep(.card-indicator.MB),
:deep(.card-indicator.GMB),
:deep(.card-indicator.EMB) {
  background-color: rebeccapurple;
  color: white;
}

:deep(.card-indicator.Frostbite) {
  color: cornflowerblue;
  font-weight: bold;
}
</style>
