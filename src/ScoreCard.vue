<script setup>
import { useScoresStore } from "@/stores/scores";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { useGameTypeStore } from "@/stores/game_type";
import { computed, ref } from "vue";
import { convertToValues, X } from "@/domain/scores";
import RoundScores from "@/components/RoundScores.vue";
import { calculateTotal } from "@/domain/subtotals";
import { useToast } from "vue-toastification";
import { useHistoryStore } from "@/stores/history";
import { insults } from "@/domain/insults";

const synth = window.speechSynthesis;

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const validScores = computed(() => gameTypeStore.currentRound.scores);
const maxReached = computed(() => scoresStore.scores.length >= gameTypeStore.currentRound.maxArrows);

//todo: this is copied from data management, DRY it up
const history = useHistoryStore();
const toast = useToast();
const date = ref(new Date().toISOString().substr(0, 10));
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)));

function saveScores(event) {
  event.preventDefault();
  try {
    history.add(date.value, runningTotal.value, gameTypeStore.type, [...scoresStore.scores], gameTypeStore.currentRound.unit);
    scoresStore.clear();
    toast.success("Scores saved, please find them in the history");

  } catch (error) {
    console.log(error);
    toast.error("Error saving scores", error);
  }
}

function clearScores() {
  if (confirm("Are you sure you want to clear all the scores for this shoot?")) {
    if (confirm("Yeah but really?")) {
      scoresStore.clear();
    }
  }
}

function addScore(score) {
  if (score === "M") {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(insults[Math.floor(Math.random() * insults.length)]);
    utterance.rate = 0.8;
    synth.speak(utterance);
  }
  scoresStore.add(score);
}

</script>

<template>
  <div class="page">
  <ScoreButtons :validScores="validScores"
                @score="addScore"
                :max-reached="maxReached"
                :scores="scoresStore.scores"
                :game-type="gameTypeStore.type"
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
    <button @click="clearScores">Clear data</button>
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
