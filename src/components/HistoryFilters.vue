<script setup>
import StatusIcon from "@/components/icons/StatusIcon.vue";
import ShootStatusFilterModal from "@/components/modals/ShootStatusFilterModal.vue";
import RoundFilterModal from "./modals/RoundFilterModal.vue";
import DateRangeFilterModal from "./modals/DateRangeFilterModal.vue";
import ClassificationFilterModal from "./modals/ClassificationFilterModal.vue";
import BaseTopBar from "./ui/BaseTopBar.vue";
import ClassificationIcon from "./icons/ClassificationIcon.vue";
import DateIcon from "./icons/DateIcon.vue";
import RoundIcon from "./icons/RoundIcon.vue";
import PersonalBestIcon from "./icons/PersonalBestIcon.vue";
import ResetIcon from "./icons/ResetIcon.vue";
import { ref, computed } from "vue";

const props = defineProps({
  pbFilterActive: Boolean,
  roundFilterActive: Boolean,
  dateFilterActive: Boolean,
  classificationFilterActive: Boolean,
  statusFilterActive: Boolean,
  availableRounds: Array,
  currentStatus: String
});

const showRoundModal = ref(false);
const showDateModal = ref(false);
const showClassificationModal = ref(false);
const showStatusModal = ref(false);
const emit = defineEmits(["filterDate", "filterRound", "filterClassification", "toggle-pb", "reset", "filterStatus"]);

// Define the action buttons for the BaseTopBar
const actionButtons = computed(() => [
  // Date Filter
  {
    iconComponent: DateIcon,
    label: "Date",
    action: "date",
    active: props.dateFilterActive,
    disabled: false
  },
  // Round Filter
  {
    iconComponent: RoundIcon,
    label: "Round",
    action: "round",
    active: props.roundFilterActive,
    disabled: false
  },
  // Classification Filter
  {
    iconComponent: ClassificationIcon,
    label: "Class",
    action: "classification",
    active: props.classificationFilterActive,
    disabled: false
  },
  // Status Filter
  {
    iconComponent: StatusIcon,
    label: "Status",
    action: "status",
    active: props.statusFilterActive,
    disabled: false
  },
  // Personal Best Filter
  {
    iconComponent: PersonalBestIcon,
    label: "PB",
    action: "pb",
    active: props.pbFilterActive,
    disabled: false
  },
  // Reset Filters
  {
    iconComponent: ResetIcon,
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
    case "status":
      showStatusModal.value = true;
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

  <ShootStatusFilterModal
    v-if="showStatusModal"
    :currentStatus="currentStatus"
    @close="showStatusModal = false"
    @select="status => emit('filterStatus', status)"
  />
</template>
