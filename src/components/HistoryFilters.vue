<script setup>
import RoundFilterModal from "./RoundFilterModal.vue";
import DateRangeFilterModal from "./DateRangeFilterModal.vue";
import ClassificationFilterModal from "./ClassificationFilterModal.vue";
import { ref } from "vue";

defineProps({
  pbFilterActive: Boolean,
  roundFilterActive: Boolean,
  dateFilterActive: Boolean,
  classificationFilterActive: Boolean,
  availableRounds: Array
});

const showRoundModal = ref(false);
const showDateModal = ref(false);
const showClassificationModal = ref(false);
const emit = defineEmits(["filterDate", "filterRound", "filterClassification", "toggle-pb"]);
</script>

<template>
  <div class="filters">
    <button
      class="filter-button"
      :class="{ active: dateFilterActive }"
      @click="showDateModal = true"
    >📅
    </button>
    <button
      class="filter-button"
      :class="{ active: roundFilterActive }"
      @click="showRoundModal = true"
    >🏹
    </button>
    <button
      class="filter-button"
      :class="{ active: classificationFilterActive }"
      @click="showClassificationModal = true"
    >🏅
    </button>
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

  <DateRangeFilterModal
    v-if="showDateModal"
    @close="showDateModal = false"
    @select="dates => emit('filterDate', dates)"
  />

  <ClassificationFilterModal
    v-if="showClassificationModal"
    @close="showClassificationModal = false"
    @select="classification => emit('filterClassification', classification)"
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
