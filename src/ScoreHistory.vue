<script setup>
import { useHistoryStore } from '@/stores/history'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import {addTopScoreIndicator} from "@/domain/topscores";
const store = useHistoryStore()
const router = useRouter()

function parseAndRenderDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function view(id) {
  router.push({ name: "viewHistory", params: { id } });
}

const sortedHistory = computed(() => {
  const sortingFunction = (a, b) => new Date(b.date) - new Date(a.date)

  return addTopScoreIndicator(store.history).sort(sortingFunction)
})

</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Distance (yards)</th>
        <th>Game type</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <tr @click="view(item.id)" v-for="item in sortedHistory" :key="item.date">
      <td>{{ parseAndRenderDate(item.date) }}</td>
      <td :class="{highlight: item.topScore}">{{ item.score }}</td>
      <td>{{ item.distance }}</td>
      <td>{{ item.gameType }}</td>
      <td>
        <button @click="store.remove(item.id)">❌</button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
td {
  text-transform: capitalize;
}
</style>
