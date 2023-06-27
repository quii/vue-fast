<script setup>
import { useScoresStore } from "@/stores/scores";
import Rounds from "@/components/Rounds.vue";
import ScoreButtons from "@/components/ScoreButtons.vue";

const store = useScoresStore();
</script>

<template>
  <main>
    <div class="wrapper">
      <h1>Fast!</h1>
      <ScoreButtons @score="store.add" />
      <button @click="store.clear()">Clear data</button>
      <Rounds v-bind:rounds="store.rounds" />
    </div>
  </main>
</template>

<style scoped>
h1 {
    color: tomato;
    font-family: "Comic Sans MS";
}
</style>
