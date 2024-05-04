<script setup>
import { useScoresStore } from "@/stores/scores";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { useGameTypeStore } from "@/stores/game_type";
import { computed, ref } from "vue";
import { getLowestScoreForRecentEnd } from "@/domain/end";
import { convertToValues, X } from "@/domain/scores";
import RoundScores from "@/components/RoundScores.vue";
import { calculateTotal } from "@/domain/subtotals";
import { useToast } from "vue-toastification";
import { useHistoryStore } from "@/stores/history";

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const lowestScore = computed(() => getLowestScoreForRecentEnd(scoresStore.scores, gameTypeStore.currentRound.endSize));
const validScores = computed(() => gameTypeStore.currentRound.scores);
const maxReached = computed(() => scoresStore.scores.length >= gameTypeStore.currentRound.maxArrows);

//todo: this is copied from data management, DRY it up
const history = useHistoryStore();
const toast = useToast();
const date = ref(new Date().toISOString().substr(0, 10));
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores)));


function saveScores(event) {
  event.preventDefault();
  try {
    history.add(date.value, runningTotal, gameTypeStore.type, scoresStore.scores, gameTypeStore.currentRound.unit);
    toast.success("Scores saved");
  } catch (error) {
    console.log(error);
    toast.error("Error saving scores", error);
  }
}

</script>

<template>
  <div class="page">
  <ScoreButtons :validScores="validScores"
                :lowestScore="lowestScore"
                @score="scoresStore.add"
                :max-reached="maxReached"
                @undo="scoresStore.undo" />

    <button class="save" v-if="maxReached" @click="saveScores">💾 Save score to history</button>


    <RoundScores :scores="scoresStore.scores"
               :game-type="gameTypeStore.type"
               :endSize="gameTypeStore.currentRound.endSize"
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
  width: 100vw;
  display: flex;
  justify-content: space-between;
}

.controls select {
  padding: 0.5em;
  font-size: 1.5em;
  flex: 1 1 0;
  max-width: 80vw;
}

.controls button {
  max-width: 20vh;
}
.page {
  width: 100vw;
}

.save {
  width: 100%;
  font-size: 1.5em;
  height: 15vh
}
</style>
