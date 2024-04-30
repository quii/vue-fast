<script setup>
import { useScoresStore } from "@/stores/scores";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { useGameTypeStore } from "@/stores/game_type";
import { computed } from "vue";
import { getLowestScoreForRecentEnd } from "@/domain/end";
import { gameTypeConfig } from "@/domain/game_types";
import { X } from "@/domain/scores";
import RoundScores from "@/components/RoundScores.vue";

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const currentRound = computed(() => gameTypeConfig[gameTypeStore.type])
const lowestScore = computed(() => getLowestScoreForRecentEnd(scoresStore.scores, currentRound.value.endSize));
const validScores = computed(() => currentRound.value.scores);
const maxReached = computed(() => scoresStore.scores.length >= currentRound.value.maxArrows);

</script>

<template>
  <div class="page">
  <ScoreButtons :validScores="validScores"
                :lowestScore="lowestScore"
                @score="scoresStore.add"
                :max-reached="maxReached"
                @undo="scoresStore.undo" />

    <RoundScores :scores="scoresStore.scores"
               :game-type="gameTypeStore.type"
               :endSize="currentRound.endSize"
               :hasX="validScores.includes(X)" />
  </div>

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

.controls select {
  padding: 0.5em;
  font-size: 1.5em;
  flex: 1 1 0;
}

.page {
  width: 100vw;
}
</style>
