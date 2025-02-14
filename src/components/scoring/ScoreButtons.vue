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
div {
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: sticky;
  flex-wrap: wrap;
  top: 0;
  align-self: flex-start;
}

.undo {
  color: var(--color-text);
}

button {
  flex: 1 1 0;
  font-size: 2.8em;
  -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
  -moz-box-sizing: border-box; /* Firefox, other Gecko */
  box-sizing: border-box; /* Opera/IE 8+ */
  height: 15vh;
  min-width: 10vh;
  font-weight: bold;
  text-align: center;
  padding: 0;
  border: 1px solid var(--color-background-mute);
}

button:disabled {
  background-color: grey;
  border-color: grey;
  color: darkgray;
}
</style>
