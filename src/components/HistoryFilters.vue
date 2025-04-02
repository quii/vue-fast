<script setup>
import RoundFilterModal from "./modals/RoundFilterModal.vue";
import DateRangeFilterModal from "./modals/DateRangeFilterModal.vue";
import ClassificationFilterModal from "./modals/ClassificationFilterModal.vue";
import BaseTopBar from "./ui/BaseTopBar.vue";
import { ref, computed } from "vue";

const props = defineProps({
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

// Define the action buttons for the BaseTopBar
const actionButtons = computed(() => [
  // Date Filter
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>`,
    label: "Date",
    action: "date",
    active: props.dateFilterActive,
    disabled: false
  },
  // Round Filter
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>`,
    label: "Round",
    action: "round",
    active: props.roundFilterActive,
    disabled: false
  },
  // Classification Filter
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="6"></circle>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
        </svg>`,
    label: "Class",
    action: "classification",
    active: props.classificationFilterActive,
    disabled: false
  },
  // Personal Best Filter
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>`,
    label: "PB",
    action: "pb",
    active: props.pbFilterActive,
    disabled: false
  },
  // Reset Filters
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v6h6"></path>
          <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
        </svg>`,
    label: "Reset",
    action: "reset",
    active: false,
    disabled: false
  }
]);

// Handle actions from BaseTopBar
function handleAction({ action }) {
  switch (action) {
    case "date":
      showDateModal.value = true;
      break;
    case "round":
      showRoundModal.value = true;
      break;
    case "classification":
      showClassificationModal.value = true;
      break;
    case "pb":
      emit("toggle-pb");
      break;
    case "reset":
      emit("reset");
      break;
  }
}
</script>

<template>
  <!-- Replace the old filter buttons with BaseTopBar -->
  <BaseTopBar
    :actionButtons="actionButtons"
    :alignment="'spread'"
    @action="handleAction"
  />

  <!-- Keep the existing modals -->
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
/* Remove the old styles since they're now handled by BaseTopBar */
</style>
