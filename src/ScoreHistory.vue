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

const groupedHistory = computed(() => {
  const history = store.sortedHistory(user.user.gender, user.user.ageGroup, user.user.bowType);
  const groups = {};

  history.forEach(item => {
    const date = item.date.split("T")[0];
    if (!groups[date]) {
      groups[date] = { items: [] };
    }
    groups[date].items.push(item);
  });

  return Object.values(groups);
});

</script>

<template>
  <table>
    <thead>
    <tr>
      <th>Date</th>
      <th colspan="2">Score</th>
      <th>Round</th>
    </tr>
    </thead>
    <tbody>
    <template v-for="(group, index) in groupedHistory" :key="index">
      <tr v-for="(item, itemIndex) in group.items" :key="item.id">
        <td v-if="itemIndex === 0" :rowspan="group.items.length" @click="view(item.id)">
          {{ parseAndRenderDate(item.date) }}
        </td>
        <td @click="view(item.id)" :class="{highlight: item.topScore}">{{ item.score }}</td>
        <td :class="[item.classification?.name, item.classification?.scheme]" @click="view(item.id)">
          {{ item.classification?.name }}
        </td>
        <td @click="view(item.id)">{{ item.gameType }}</td>
      </tr>
    </template>
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
