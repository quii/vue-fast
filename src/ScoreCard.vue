<script setup>
import { useScoresStore } from "@/stores/scores";
import RoundScores from "@/components/RoundScores.vue";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { useGameTypeStore } from "@/stores/game_type";
import { computed } from "vue";
import { getLowestScoreForRecentEnd } from "@/domain/end";
import { gameTypeConfig } from "@/domain/game_types";
import { X } from "@/domain/scores";

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const lowestScore = computed(() => getLowestScoreForRecentEnd(scoresStore.scores, gameTypeConfig[gameTypeStore.type].endSize));
const validScores = computed(() => gameTypeConfig[gameTypeStore.type].scores);

</script>

<template>
  <ScoreButtons :validScores="validScores"
                :lowestScore="lowestScore"
                @score="scoresStore.add"
                @undo="scoresStore.undo" />

  <RoundScores :scores="scoresStore.scores"
               :game-type="gameTypeStore.type"
               :hasX="validScores.includes(X)" />

  <div class="controls">
    <GameTypeSelector :gameType="gameTypeStore.type"
                      @changeGameType="gameTypeStore.setGameType" />
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
  flex: 1 1 0;
}
</style>
