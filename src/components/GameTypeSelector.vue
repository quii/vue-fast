<script setup>
import { ref, computed } from "vue";
import RoundCard from "./RoundCard.vue";
import { gameTypes } from "@/domain/scoring/game_types";
import { useHistoryStore } from "@/stores/history";
import { formatRoundName } from "@/domain/round_details";

defineProps({
  gameType: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["changeGameType"]);
const history = useHistoryStore();
const showModal = ref(false);
const searchQuery = ref("");

const recentTypes = computed(() => history.getRecentGameTypes());
const otherTypes = computed(() =>
  gameTypes.filter(type => !recentTypes.value.includes(type))
);

const filteredRecentTypes = computed(() => {
  if (!searchQuery.value) return recentTypes.value;
  return recentTypes.value.filter(type =>
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredOtherTypes = computed(() => {
  if (!searchQuery.value) return otherTypes.value;
  return otherTypes.value.filter(type =>
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function selectRound(type) {
  emit("changeGameType", type);
  showModal.value = false;
}
</script>
<template>
  <div>
    <button class="select-button" @click="showModal = true">
      <span v-if="gameType">{{ formatRoundName(gameType) }}</span>
      <span v-else>Select the round you're shooting</span>
    </button>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Select Round</h2>
          <button class="close-button" @click="showModal = false">×</button>
        </div>

        <div class="search-container">
          <input type="text" v-model="searchQuery" placeholder="Search rounds..." />
        </div>

        <div class="rounds-container">
          <div v-if="filteredRecentTypes.length">
            <h3>Recent Rounds</h3>
            <RoundCard
              v-for="type in filteredRecentTypes"
              :key="type"
              :round="{ round: type }"
              @click="selectRound(type)"
            />
          </div>

          <div>
            <h3>All Rounds</h3>
            <RoundCard
              v-for="type in filteredOtherTypes"
              :key="type"
              :round="{ round: type }"
              @click="selectRound(type)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.select-button {
  width: 100%;
  padding: 0.5em;
  font-size: 1.2em;
  text-align: left;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background-color: var(--color-background);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
}

.search-container {
  padding: 1em;
  border-bottom: 1px solid var(--color-border);
}

.search-container input {
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.rounds-container {
  padding: 1em;
  overflow-y: auto;
}

.rounds-container h3 {
  margin-top: 0;
  margin-bottom: 0.5em;
}
</style>
