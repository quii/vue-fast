<script setup>
import RoundFilterModal from "./RoundFilterModal.vue";
import { ref } from "vue";

const props = defineProps({
  pbFilterActive: Boolean,
  roundFilterActive: Boolean,
  availableRounds: Array
});

const showRoundModal = ref(false);
const emit = defineEmits(["filterDate", "filterRound", "filterClassification", "toggle-pb"]);
</script>

<template>
  <div class="filters">
    <button class="filter-button" @click="emit('filterDate')">📅</button>
    <button
      class="filter-button"
      :class="{ active: roundFilterActive }"
      @click="showRoundModal = true"
    >🏹
    </button>
    <button class="filter-button" @click="emit('filterClassification')">🏅</button>
    <button
      class="filter-button"
      :class="{ active: pbFilterActive }"
      @click="emit('toggle-pb')"
    >🌟
    </button>
  </div>

  <RoundFilterModal
    v-if="showRoundModal"
    :rounds="availableRounds"
    @close="showRoundModal = false"
    @select="round => emit('filterRound', round)"
  />
</template>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
}

.filter-button {
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  border-radius: 8px;
  cursor: pointer;
}

.filter-button:hover {
  background: var(--color-background-mute);
}

.filter-button.active {
  background: var(--color-background-mute);
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px #4CAF50;
}
</style>
