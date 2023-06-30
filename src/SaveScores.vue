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
  <div>
    <label for="date">Date <input type="date" id="date" name="date" v-model="date"> </label>

    <label for="distance1">Distance
    <input type="number" id="distance" name="distance" min="20" max="100" step="10" v-model="distance" list="distances">
      </label>
    <button type="submit" @click="saveScores">💾 Save score of {{scores.runningTotal}} ({{scores.gameType}})</button>
  </div>

  <datalist id="distances">
    <option value="20" />
    <option value="30" />
    <option value="40" />
    <option value="50" />
    <option value="60" />
    <option value="70" />
    <option value="80" />
    <option value="90" />
    <option value="100" />
  </datalist>
</template>

<style scoped>
  div {
    display: flex;
    flex-direction: column;
      /* vertical space between items */
      gap: 1em;
      padding: 1em;
  }

  input {
      font-size: 1.5em;
  }

  label {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
  }

  button {
      font-size: 1.5em;
      padding: 0.5em;
  }
</style>