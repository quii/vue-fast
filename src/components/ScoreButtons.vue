<script setup>
import { validScores } from "@/domain/scores";

defineEmits(["score", "undo"]);
</script>

<template>
  <div class="score-buttons">
    <button v-for="score in validScores"
            :key="score"
            @click="$emit('score', score)">{{ score }}
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
    top: 0;
    align-self: flex-start
}

button {
    flex: 1 1 0px;
    font-size: 2em;
}
</style>
