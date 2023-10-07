<script setup>
import { computed, ref } from "vue";
import { useHistoryStore } from "@/stores/history";
import { useScoresStore } from "@/stores/scores";
import { useToast } from "vue-toastification";
import { useGameTypeStore } from "@/stores/game_type";

import { calculateTotal } from "@/domain/subtotals";
import { gameTypeConfig } from "@/domain/game_types";

const history = useHistoryStore();
const scores = useScoresStore();
const gameTypeStore = useGameTypeStore();

const toast = useToast();

const distance = ref(40);
const importData = ref("");
const date = ref(new Date().toISOString().substr(0, 10));

const runningTotal = computed(() => calculateTotal(scores.scores))
const maxDate = new Date().toLocaleDateString('fr-ca')

function saveScores(event) {
  event.preventDefault()
  history.add(date.value, runningTotal, distance.value, gameTypeStore.type, scores.scores, gameTypeConfig[gameTypeStore.type].unit);
  toast.success('Scores saved')
}

function copyHistory() {
  navigator.clipboard.writeText(JSON.stringify(history.history))
  toast.success('History copied to clipboard')
}

function importHistory() {
  history.importHistory(JSON.parse(importData.value))
  toast.success('History imported')
}
</script>
<template>
  <div>
    <h1>Save scores</h1>
    <label for="date"
      >Date <input type="date" id="date" name="date" v-model="date" :max="maxDate" />
    </label>

    <label for="distance1"
      >Distance
      <input
        type="number"
        id="distance"
        name="distance"
        min="20"
        max="100"
        step="10"
        v-model="distance"
        list="distances"
      />
    </label>
    <button type="submit" @click="saveScores">💾 Save score {{ runningTotal }}</button>
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
