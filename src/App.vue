<script setup>
import { useScoresStore } from "@/stores/scores";
import Rounds from "@/components/Rounds.vue";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";

const scores = useScoresStore();

</script>

<template>
  <main>
    <div class="score-buttons">
      <ScoreButtons @score="scores.add" />
    </div>
    <div class="controls">
      <GameTypeSelector v-bind:gameType="scores.gameType" @changeGameType="scores.setGameType" />
      <button @click="scores.clear()">Clear data</button>
    </div>
    <Rounds v-bind:rounds="scores.rounds"
            v-bind:runningTotal="scores.runningTotal"
            v-bind:totalGolds="scores.totalGolds"
            v-bind:totalHits="scores.totalHits"
    />
  </main>
</template>

<style scoped>
.controls {
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.controls button {
    flex: 1 1 0px;
}
</style>
