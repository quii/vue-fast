<script setup>
import { useHistoryStore } from '@/stores/history'
import { useRouter } from 'vue-router'
import { computed } from "vue";
const store = useHistoryStore()
const router = useRouter()

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

const totalArrows = computed(() => store.totalArrows());

</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Round</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <tr v-for="item in store.sortedHistory()"
        :key="item.date">
      <td @click="view(item.id)">{{ parseAndRenderDate(item.date) }}</td>
      <td @click="view(item.id)" :class="{highlight: item.topScore}">{{ item.score }}</td>
      <td @click="view(item.id)">{{ item.gameType }}</td>
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
