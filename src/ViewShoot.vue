<script setup>
import { useRoute, useRouter } from "vue-router";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig } from "@/domain/game_types";
import { computed, ref } from "vue";
import RoundScores from "@/components/RoundScores.vue";
import { useUserStore } from "@/stores/user";
import { useScreenOrientation } from "@vueuse/core";
import UserNotes from "@/components/UserNotes.vue";
import PrintModal from "./components/PrintModal.vue";
import ArcherDetails from "@/components/ArcherDetails.vue";


const showPrintModal = ref(false);

const route = useRoute();
const router = useRouter();
const history = useHistoryStore();
const userStore = useUserStore();

history.setShootToView(route.params.id);

const endSize = computed(() => gameTypeConfig[history.selectedShoot.gameType].endSize);
const scores = computed(() => history.selectedShoot.scores);
const gameType = computed(() => history.selectedShoot.gameType);
const date = computed(() => history.selectedShoot.date);
const {
  orientation
} = useScreenOrientation();


function deleteShoot() {
  if (confirm(`Are you sure you want to delete this shoot? This action cannot be undone.`)) {
    history.remove(history.selectedShoot.id);
    router.push("/history");
  }
}
</script>

<template>
  <div id="scores">
    <h1>{{ gameType }} - {{ date }}</h1>
    <ArcherDetails
      :name="userStore.user.name"
      :age-group="userStore.user.ageGroup"
      :gender="userStore.user.gender"
      :bow-type="userStore.user.bowType"
    />
    <RoundScores :scores="scores"
                 :end-size="endSize"
                 :game-type="gameType" />

  </div>
  <p class="tip" v-if="orientation!=='landscape-primary'">💡 Try turning your phone into landscape to see the full
    scoresheet</p>
  <button class="download-button" @click="showPrintModal = true">
    Download Score Sheet 💾
  </button>
  <PrintModal
    v-if="showPrintModal"
    :shoot="history.selectedShoot"
    :archer-name="userStore.user.name"
    :age-group="userStore.user.ageGroup"
    :gender="userStore.user.gender"
    :bow-type="userStore.user.bowType"
    :end-size="endSize"
    :game-type="gameType"
    :date="date"
    @close="showPrintModal = false"
  />
  <UserNotes :shoot-id="history.selectedShoot.id" :allow-highlight="true" />

  <hr />
  <div class="danger-zone">
    <button class="delete-button" @click="deleteShoot">
      ⚠️ Delete this shoot ⚠️
    </button>
  </div>

</template>

<style scoped>
.download-button {
  display: block;
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.download-button:hover {
  background: #45a049;
}
h1 {
  text-transform: capitalize;
  text-align: center;
}

.details {
  text-transform: capitalize;
}

.signatures p {
  padding-top: 5em;
}

.signatures input {
  height: 1.8em;
  padding-left: 1em;
  border: none;
}

.tip {
  text-align: center;
  font-size: 1.2em;
  font-style: italic;
  font-weight: bold;
  margin-top: 1em;
}

button {
  margin-left: 1em;
  font-size: 1em;
}

.delete-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  margin: 1rem 0;
}
</style>

const style = document.createElement('style');
style.textContent = `
body { font-family: Arial; padding: 20px; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 1px solid black; padding: 8px; text-align: center; }
.score { font-weight: bold; }
.signatures { margin-top: 2em; }
#classification { display: none; }
`;

