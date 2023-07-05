<script setup>
import { useScoresStore } from "@/stores/scores";
import RoundScores from "@/components/RoundScores.vue";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { validScores } from "@/domain/scores";

const scoresStore = useScoresStore();

</script>

<template>
  <ScoreButtons @score="scoresStore.add"
                :validScores="validScores"
                @undo="scoresStore.undo" />
    <RoundScores :scores="scoresStore.scores" />
    <div class="controls">
      <GameTypeSelector v-bind:gameType="scoresStore.gameType" @changeGameType="scoresStore.setGameType" />
      <button @click="scoresStore.clear()">Clear data</button>
    </div>
</template>

<style scoped>
.controls {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.controls button {
    padding: 0.5em;
    font-size: 1.5em;
    flex: 1 1 0px;
}
</style>
