<script setup>
import { ref } from "vue";
import { useHistoryStore } from "@/stores/history";
import { useScoresStore } from "@/stores/scores";

const history = useHistoryStore()
const scores = useScoresStore();

const distance = ref(40);
const date = ref(new Date().toISOString().substr(0, 10));

function saveScores(event) {
  event.preventDefault();
  history.add(date.value, scores.runningTotal, distance.value, scores.gameType)
}
</script>
<template>
  <form>
<!--    date picker-->
    <label for="date">Date</label>
    <input type="date" id="date" name="date" v-model="date">
    <label for="distance1">Distance</label>
    <input type="number" id="distance" name="distance" min="20" max="100" step="10" v-model="distance">
    <button type="submit" @click="saveScores">Save scores</button>
  </form>
</template>