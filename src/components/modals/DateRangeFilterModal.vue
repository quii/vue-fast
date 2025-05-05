<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import FormGroup from "@/components/ui/FormGroup.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { ref } from "vue";

const emit = defineEmits(["close", "select"]);
const startDate = ref("");
const endDate = ref(new Date().toISOString().split("T")[0]);

function handleSelect() {
  emit("select", { startDate: startDate.value, endDate: endDate.value });
  emit("close");
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Function to apply date range and close modal
function applyAndClose(start, end) {
  emit("select", { startDate: start, endDate: end });
  emit("close");
}

// Quick selection functions that immediately apply the filter and close the modal
function selectLastMonth() {
  const today = new Date();
  const end = formatDate(today);

  // Set start date to 1 month ago
  const start = new Date(today);
  start.setMonth(start.getMonth() - 1);

  applyAndClose(formatDate(start), end);
}

function selectLast3Months() {
  const today = new Date();
  const end = formatDate(today);

  // Set start date to 3 months ago
  const start = new Date(today);
  start.setMonth(start.getMonth() - 3);

  applyAndClose(formatDate(start), end);
}

function selectLast12Months() {
  const today = new Date();
  const end = formatDate(today);

  // Set start date to 12 months ago
  const start = new Date(today);
  start.setMonth(start.getMonth() - 12);

  applyAndClose(formatDate(start), end);
}

function selectThisYear() {
  const today = new Date();
  const end = formatDate(today);

  // Set start date to January 1st of current year
  const start = new Date(today.getFullYear(), 0, 1);

  applyAndClose(formatDate(start), end);
}

function selectAllTime() {
  // Clear start date to indicate no lower bound
  applyAndClose("", formatDate(new Date()));
}
</script>

<template>
  <BaseModal title="Filter by Date Range">
    <!-- Quick selection buttons -->
    <div class="quick-select-container">
      <div class="quick-select-label">Quick Select:</div>
      <div class="quick-select-buttons">
        <BaseButton
          variant="outline"
          size="small"
          @click="selectLastMonth"
        >
          Last Month
        </BaseButton>

        <BaseButton
          variant="outline"
          size="small"
          @click="selectLast3Months"
        >
          Last 3 Months
        </BaseButton>

        <BaseButton
          variant="outline"
          size="small"
          @click="selectLast12Months"
        >
          Last 12 Months
        </BaseButton>

        <BaseButton
          variant="outline"
          size="small"
          @click="selectThisYear"
        >
          This Year
        </BaseButton>

        <BaseButton
          variant="outline"
          size="small"
          @click="selectAllTime"
        >
          All Time
        </BaseButton>
      </div>
    </div>

    <div class="separator">
      <span>Or select custom range</span>
    </div>

    <FormGroup label="From">
      <BaseInput type="date" v-model="startDate" />
    </FormGroup>

    <FormGroup label="To">
      <BaseInput type="date" v-model="endDate" />
    </FormGroup>

    <ButtonGroup>
      <BaseButton
        variant="outline"
        @click="emit('close')"
      >
        Cancel
      </BaseButton>

      <BaseButton
        variant="primary"
        @click="handleSelect"
      >
        Apply Filter
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<style scoped>
.quick-select-container {
  margin-bottom: 1rem;
}

.quick-select-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.quick-select-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Make buttons smaller and more compact */
.quick-select-buttons :deep(button) {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: var(--color-text-light, #666);
  font-size: 0.9rem;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border, #ddd);
}

.separator span {
  padding: 0 0.75rem;
}
</style>