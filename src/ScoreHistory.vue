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
      <td :class="[item.classification?.name, item.classification?.scheme]"
          @click="view(item.id)">{{ item.classification?.name }}
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

.B3, .B2, .B1, .A3, .A2, .A1, .MB, .GMB, .EMB {
  text-align: center;
  font-weight: bold;
  color: white;
}

.Frostbite {
  color: cornflowerblue;
  font-weight: bold;
}

.B1 {
  background-color: hsl(3, 84%, 36%);
}

.B2 {
  background-color: hsl(3, 84%, 46%);
}

.B3 {
  background-color: hsl(3, 84%, 56%);
}

.A3 {
  background-color: hsl(207, 85%, 90%);
}

.A2 {
  background-color: hsl(207, 85%, 80%);
}

.A1 {
  background-color: hsl(207, 85%, 72%);
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
}

.A1, .A2, .A3 {
  color: #061345;
}

</style>
