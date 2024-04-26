<script setup>
import { useHistoryStore } from '@/stores/history'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import {addTopScoreIndicator} from "@/domain/topscores";
import { gameTypeConfig } from "@/domain/game_types";
const store = useHistoryStore()
const router = useRouter()

const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
const dateFormat = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric"
};

function parseAndRenderDate(date) {
  return new Date(date).toLocaleDateString("en-GB", dateFormat);
}

function view(id) {
  router.push({ name: "viewHistory", params: { id } });
}

const sortedHistory = computed(() => addTopScoreIndicator(store.history).sort(sortByDate));
const totalArrows = computed(() => store.history.reduce((acc, item) => acc + item.scores.length, 0));

console.log(sortedHistory);
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Distance</th>
        <th>Round</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <tr :class="{outdoor: gameTypeConfig[item.gameType].isOutdoor}" @click="view(item.id)" v-for="item in sortedHistory"
        :key="item.date">
      <td>{{ parseAndRenderDate(item.date) }}</td>
      <td :class="{highlight: item.topScore}">{{ item.score }}</td>
      <td>{{ item.distance }} {{ item.unit || "yd" }}</td>
      <td>{{ item.gameType }}</td>
      <td>
        <button @click="store.remove(item.id)">❌</button>
      </td>
    </tr>
    </tbody>
  </table>
  <p>You have recorded {{ totalArrows }} arrows shot!</p>
</template>

<style scoped>
td {
  text-transform: capitalize;
}

p {
  text-align: center;
}
</style>
