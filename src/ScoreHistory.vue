<script setup>
import { useHistoryStore } from "@/stores/history";
import { useRouter } from "vue-router";
const store = useHistoryStore()
const router = useRouter()

function parseAndRenderDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function view(index) {
  router.push({ path: `/history/${index}`});
}
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
      <tr @click="view(index)" v-for="(item, index) in store.history" :key="item.date">
        <td>{{ parseAndRenderDate(item.date) }}</td>
        <td>{{ item.score }}</td>
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
