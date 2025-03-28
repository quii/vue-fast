<script setup>
import RoundFilterModal from "./modals/RoundFilterModal.vue";
import DateRangeFilterModal from "./modals/DateRangeFilterModal.vue";
import ClassificationFilterModal from "./modals/ClassificationFilterModal.vue";
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
const emit = defineEmits(["filterDate", "filterRound", "filterClassification", "toggle-pb", "reset"]);
</script>

<template>
  <div class="filters-container">
    <div class="filters">
      <!-- Date Filter -->
      <button
        class="filter-button"
        :class="{ active: dateFilterActive }"
        @click="showDateModal = true"
        aria-label="Filter by date"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span class="filter-label">Date</span>
      </button>

      <!-- Round Filter -->
      <button
        class="filter-button"
        :class="{ active: roundFilterActive }"
        @click="showRoundModal = true"
        aria-label="Filter by round"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
        <span class="filter-label">Round</span>
      </button>

      <!-- Classification Filter -->
      <button
        class="filter-button"
        :class="{ active: classificationFilterActive }"
        @click="showClassificationModal = true"
        aria-label="Filter by classification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
          <circle cx="12" cy="8" r="6"></circle>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
        </svg>
        <span class="filter-label">Class</span>
      </button>

      <!-- Personal Best Filter -->
      <button
        class="filter-button"
        :class="{ active: pbFilterActive }"
        @click="emit('toggle-pb')"
        aria-label="Show personal bests only"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span class="filter-label">PB</span>
      </button>

      <!-- Reset Filters -->
      <button
        class="filter-button"
        @click="emit('reset')"
        aria-label="Reset all filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
          <path d="M3 2v6h6"></path>
          <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
        </svg>
        <span class="filter-label">Reset</span>
      </button>
    </div>
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
.filters-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin: 0.5em 0 0.5em 0; /* Reduced horizontal margins to 0 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filters {
  display: flex;
  justify-content: space-around;
  padding: 0.75em 0.5em;
}

.filter-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--color-background);
  border: none;
  color: var(--color-text-light);
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0.5em;
}

.filter-button:active {
  transform: scale(0.95);
}

.filter-button.active {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
}

.filter-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 0.25em;
}

.filter-label {
  font-size: 0.7em;
  font-weight: 500;
}

@media (min-width: 768px) {
  .filters {
    justify-content: center;
    gap: 1.5rem;
  }

  .filter-button {
    width: 70px;
  }
}
</style>
