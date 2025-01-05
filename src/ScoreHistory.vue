<template>
  <div class="fullpage" @touchstart="handleTouchStart"
       @touchend="handleTouchEnd">

    <div v-if="!isDiaryMode">
      <table>
        <thead>
        <tr>
          <th>Date</th>
          <th>Round</th>
          <th colspan="2">Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in store.sortedHistory(user.user.gender, user.user.ageGroup, user.user.bowType)"
            :key="item.id">
          <td @click="view(item.id)">{{ parseAndRenderDate(item.date) }}</td>
          <td @click="view(item.id)">{{ item.gameType }}</td>
          <td @click="view(item.id)" :class="{highlight: item.topScore}">{{ item.score }}</td>
          <td :class="[item.classification?.name, item.classification?.scheme]" @click="view(item.id)">
            {{ item.classification?.name }}
          </td>
        </tr>
        </tbody>
      </table>
      <p>You have recorded {{ totalArrows }} arrows shot!</p>
    </div>

    <div v-else class="diary-view">
      <article v-for="shoot in shootsWithNotes"
               :key="shoot.id"
               class="diary-entry">
        <header>
          <h2>{{ parseAndRenderDate(shoot.date) }} - {{ shoot.gameType.charAt(0).toUpperCase() + shoot.gameType.slice(1)
            }} - {{ shoot.score }}</h2>
        </header>
        <UserNotes :shootId="shoot.id" />
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserNotes from "@/components/UserNotes.vue";
import { useHistoryStore } from "@/stores/history";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";

const store = useHistoryStore();
const router = useRouter();
const user = useUserStore();
const notesStore = useNotesStore();
const isDiaryMode = ref(false);

const startX = ref(0);

function handleTouchStart(e) {
  startX.value = e.touches[0].screenX;
}

function handleTouchEnd(e) {
  const endX = e.changedTouches[0].screenX;
  const swipeDistance = endX - startX.value;
  const swipeThreshold = 50;


  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0 && isDiaryMode.value) {
      isDiaryMode.value = false; // Swipe right to table
    } else if (swipeDistance < 0 && !isDiaryMode.value && shootsWithNotes.value.length > 0) {
      isDiaryMode.value = true; // Swipe left to diary
    }
  }
}

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

const shootsWithNotes = computed(() => {
  return store.sortedHistory(user.user.gender, user.user.ageGroup, user.user.bowType)
    .filter(shoot => notesStore.getNotesByShootId(shoot.id).length > 0);
});
</script>

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

.diary-entry {
  margin: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.diary-entry header {
  margin-bottom: 1rem;
}

.diary-entry h2 {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fullpage {
  min-height: 100vh;
}
</style>
