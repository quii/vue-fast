<script setup>
import { calculateScoreIsValidForEnd } from "@/domain/scoring/end";
import useButtonClass from "@/composeaables/useButtonClass";

defineProps({
  validScores: {
    type: Array,
    required: true
  },
  maxReached: {
    type: Boolean,
    required: true
  },
  scores: {
    required: true
  },
  gameType: {
    type: String,
    required: true
  }
})

defineEmits(['score', 'undo'])

const buttonClass = useButtonClass();
</script>

<template>
  <div class="score-buttons">
    <button
      v-for="score in validScores"
      :key="score"
      :disabled="!calculateScoreIsValidForEnd(scores, gameType)(score) || maxReached"
      :class="buttonClass(score, gameType)"
      :data-test="`score-${score}`"
      @click="$emit('score', { score, position: null })"
    >
      {{ score }}
    </button>
    <button class="undo" @click="$emit('undo')">⌫</button>
  </div>
</template>
<style scoped>
.score-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: sticky;
  flex-wrap: wrap;
  top: 0;
  align-self: flex-start;
  background-color: var(--color-background-soft);
  border-radius: 0 0 8px 8px;
  padding: 0.10em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

button {
  flex: 1 1 0;
  font-size: 2.4em;
  box-sizing: border-box;
  height: 12vh;
  min-height: 50px;
  max-height: 80px;
  min-width: 10vh;
  font-weight: bold;
  text-align: center;
  padding: 0;
  margin: 0.1em;
  border-radius: 6px;
  border: none;
  transition: transform 0.1s ease;
}

button:active {
  transform: scale(0.97);
}

.undo {
  color: var(--color-text);
  background-color: var(--color-background-mute);
}

button:disabled {
  opacity: 0.5;
  background-color: var(--color-background-mute);
  color: var(--color-text-light);
}

/* Gold scores */
.gold {
  background-color: #FFD700;
  color: #333;
}

/* Red scores */
.red {
  background-color: #E53935;
  color: white;
}

/* Blue scores */
.blue {
  background-color: #1E88E5;
  color: white;
}

/* Black scores */
.black {
  background-color: #212121;
  color: white;
}

/* White scores */
.white {
  background-color: #F5F5F5;
  color: #333;
}

/* Miss */
.miss {
  background-color: #757575;
  color: white;
}
</style>
