<script setup>
import { useHistoryStore } from '@/stores/history'
import { useRouter } from 'vue-router'
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
const store = useHistoryStore()
const router = useRouter()
const user = useUserStore();

const dateFormat = {
  day: "numeric",
  month: "numeric",
  year: "numeric"
};

function parseAndRenderDate(date) {
  return new Date(date).toLocaleDateString("en-GB", dateFormat);
}

function view(id) {
  router.push({ name: "viewHistory", params: { id } });
}

const totalArrows = computed(() => store.totalArrows());

function deleteRecord(id, gameType, score) {
  if (confirm(`Are you sure you want to delete the record for ${gameType} (Score: ${score})`)) {
    store.remove(id);
  }
}

</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th colspan="2">Score</th>
        <th>Round</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <tr v-for="item in store.sortedHistory(user.user.gender, user.user.ageGroup, user.user.bowType)"
        :key="item.date">
      <td @click="view(item.id)">{{ parseAndRenderDate(item.date) }}</td>
      <td @click="view(item.id)" :class="{highlight: item.topScore}">{{ item.score }}</td>
      <td :class="{bowmen: item.classification?.includes('B'), archer: item.classification?.includes('A')}"
          @click="view(item.id)">{{ item.classification }}
      </td>
      <td @click="view(item.id)">{{ item.gameType }}</td>
      <td>
        <button @click="deleteRecord(item.id, item.gameType, item.score)">❌</button>
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

.bowmen, .archer {
  text-align: center;
  font-weight: bold;
  color: white;
}

.bowmen {
  background-color: #A9170F;
}

.archer {
  background-color: #7CBFF4;
}
</style>
