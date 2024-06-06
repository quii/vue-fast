<script setup>
import { computed, ref } from "vue";
import { useHistoryStore } from "@/stores/history";
import { useScoresStore } from "@/stores/scores";
import { useToast } from "vue-toastification";
import { useGameTypeStore } from "@/stores/game_type";

import { calculateTotal } from "@/domain/subtotals";
import { convertToValues } from "@/domain/scores";

const history = useHistoryStore();
const scores = useScoresStore();
const gameTypeStore = useGameTypeStore();

const toast = useToast();

const importData = ref("");
const date = ref(new Date().toISOString().substr(0, 10));

const runningTotal = computed(() => calculateTotal(convertToValues(scores.scores, gameTypeStore.type)));
const maxDate = new Date().toLocaleDateString('fr-ca')

function saveScores(event) {
  event.preventDefault()
  try {
    history.add(date.value, runningTotal, gameTypeStore.type, scores.scores, gameTypeStore.currentRound.unit);
    toast.success("Scores saved");
  } catch (error) {
    console.log(error);
    document.getElementById("debug").innerHTML = error.message;
    toast.error("Error saving scores", error);
  }
}

function copyHistory() {
  navigator.clipboard.writeText(JSON.stringify(history.history))
  toast.success('History copied to clipboard')
}

function importHistory() {
  try {
    history.importHistory(JSON.parse(importData.value));
    toast.success("History imported");
  } catch (error) {
    console.log(error);
    document.getElementById("debug").innerHTML = error.message;
    toast.error("unable to import history");
  }
}

function hardReset() {
  localStorage.clear();
  toast.info("Local data removed");
}
</script>
<template>
  <div>
    <h1>Save score for {{ gameTypeStore.type }}</h1>
    <label for="date"
      >Date <input type="date" id="date" name="date" v-model="date" :max="maxDate" />
    </label>
    <button type="submit" @click="saveScores">💾 Save {{ runningTotal }}</button>
  </div>
  <div>
    <h1>Export data</h1>
    <button type="button" @click="copyHistory">📤 Copy history to clipboard</button>
  </div>
  <div>
    <h1>Import data</h1>
    <textarea v-model="importData" rows="10"></textarea>
    <button type="button" @click="importHistory">📥 Import history</button>
  </div>
  <div>
    <h1>Hard reset</h1>
    <h2>⚠️ Will remove all data</h2>
    <button type="button" @click="hardReset">Reset</button>
  </div>
  <div id="debug">

  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
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
