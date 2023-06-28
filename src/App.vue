<script setup>
import { useScoresStore } from "@/stores/scores";
import Rounds from "@/components/Rounds.vue";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";

const scores = useScoresStore();

</script>

<template>
  <main>
    <div class="wrapper">
      <h1>Fast!</h1>
      <GameTypeSelector v-bind:gameType="scores.gameType" @changeGameType="scores.setGameType" />
      <ScoreButtons @score="scores.add" />
      <button @click="scores.clear()">Clear data</button>
      <Rounds v-bind:rounds="scores.rounds" />
    </div>
  </main>
</template>

<style scoped>
h1 {
    color: tomato;
    font-family: "Comic Sans MS";
}
</style>
