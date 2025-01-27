<template>
  <div class="fullpage" @touchstart="handleTouchStart"
       @touchend="handleTouchEnd">

    <div v-if="!isDiaryMode">
      <HistoryFilters
        :pb-filter-active="pbFilterActive"
        :round-filter-active="roundFilterActive"
        :date-filter-active="dateFilterActive"
        :classification-filter-active="classificationFilterActive"
        :available-rounds="availableRounds"
        @toggle-pb="handlePBToggle"
        @filter-round="handleRoundFilter"
        @filter-date="handleDateFilter"
        @filter-classification="handleClassificationFilter"
        @reset="handleReset"
      />

      <table>
        <thead>
        <tr>
          <th>Date</th>
          <th>Round</th>
          <th colspan="2">Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in filteredHistory"
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
               class="diary-entry"
               @click="view(shoot.id)">
        <header>
          <time>{{ parseAndRenderDate(shoot.date) }}</time>
          <h2>
            {{ shoot.gameType.charAt(0).toUpperCase() + shoot.gameType.slice(1) }}
            <span v-if="shoot.classification"
                  :class="[shoot.classification.name, shoot.classification.scheme, 'classLabel']">
      {{ shoot.classification.name }} - {{ shoot.score }}
    </span>
          </h2>
        </header>
        <UserNotes :shootId="shoot.id" />
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import UserNotes from "@/components/UserNotes.vue";
import { useHistoryStore } from "@/stores/history";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";
import HistoryFilters from "@/components/HistoryFilters.vue";

const store = useHistoryStore();
const router = useRouter();
const user = useUserStore();
const notesStore = useNotesStore();

const isDiaryMode = ref(false);
const roundFilter = ref("");
const roundFilterActive = computed(() => roundFilter.value !== "");
const dateFilter = ref({ startDate: "", endDate: "" });
const dateFilterActive = computed(() => Boolean(dateFilter.value.startDate || dateFilter.value.endDate));
const classificationFilter = ref("");
const classificationFilterActive = computed(() => Boolean(classificationFilter.value));
const pbFilterActive = ref(false);
const startX = ref(0);

//todo: this should all be moved into the store too
const sortedHistoryData = ref([]);
watchEffect(async () => {
  sortedHistoryData.value = await store.sortedHistory(
    user.user.gender,
    user.user.ageGroup,
    user.user.bowType
  );
});
const availableRounds = computed(() => [...new Set(sortedHistoryData.value.map(h => h.gameType))]);

const filteredHistory = ref([]);

watchEffect(async () => {
  filteredHistory.value = await store.getFilteredHistory({
    pbOnly: pbFilterActive.value,
    round: roundFilter.value,
    dateRange: dateFilter.value,
    classification: classificationFilter.value
  }, user.user);
})

function handleClassificationFilter(classification) {
  classificationFilter.value = classification;
}

function handleDateFilter(dates) {
  dateFilter.value = dates;
}

function handleRoundFilter(round) {
  roundFilter.value = round;
}

function handlePBToggle() {
  pbFilterActive.value = !pbFilterActive.value;
}

function handleTouchStart(e) {
  startX.value = e.touches[0].screenX;
}

function handleReset() {
  pbFilterActive.value = false;
  roundFilter.value = "";
  dateFilter.value = { startDate: "", endDate: "" };
  classificationFilter.value = "";
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
  return sortedHistoryData.value.filter(shoot => notesStore.getNotesByShootId(shoot.id).length > 0);
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

.diary-entry:first-child {
  margin-top: 0;
}
.diary-entry {
  margin: 1rem;
  padding: 1rem 0.5rem 0 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.diary-entry time {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.diary-entry h2 {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.5;
}

.diary-entry :deep(.notes-container) {
  padding: 0;
}

.diary-entry :deep(.note-row) {
  border-bottom: none;
}

.classLabel {
  font-size: 1rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  margin-left: 0.5rem;
}
</style>
