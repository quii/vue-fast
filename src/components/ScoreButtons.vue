<script setup>
import { validScores } from "@/domain/scores";

defineEmits(["score"]);
</script>

<template>
  <div class="score-buttons">
    <button v-for="score in validScores"
            :key="score"
            @click="$emit('score', score)">{{ score }}
    </button>
  </div>
</template>

<style scoped>
div {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

button {
    flex: 1 1 0px;
    font-size: 2em;
}

button {
    flex: 1 1 0px;
}
</style>
