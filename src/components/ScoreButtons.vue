<script setup>
import { convertToValue } from "@/domain/scores";

defineProps({
  validScores: {
    type: Array,
    required: true
  },
  lowestScore: {
    type: Number,
    required: true
  }
})

defineEmits(['score', 'undo'])
</script>

<template>
  <div class="score-buttons">
    <button
      v-for="score in validScores"
      :key="score"
      :disabled="convertToValue(score)>lowestScore"
      :class="'score' + score"
      :data-test="`score-${score}`"
      @click="$emit('score', score)"
    >
      {{ score }}
    </button>
    <button @click="$emit('undo')">↩️</button>
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

button {
  flex: 1 1 0;
  font-size: 2em;
  -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
  -moz-box-sizing: border-box; /* Firefox, other Gecko */
  box-sizing: border-box; /* Opera/IE 8+ */
  height: 15vh;
}

button:disabled {
  background-color: grey;
  border-color: grey;
  color: darkgray;
}
</style>
