<script setup>
import { ref } from "vue";
import { getAllShootStatuses, getShootStatusDisplayName } from "@/domain/shoot/shoot_status.js";
import BaseButton from "@/components/ui/BaseButton.vue";

const props = defineProps({
  currentStatus: {
    type: String,
    default: null
  }
});

const emit = defineEmits(["close", "select"]);
const selectedStatus = ref(props.currentStatus);
const statuses = getAllShootStatuses();

function selectStatus(status) {
  emit("select", status);
  emit("close");
}

function clearFilter() {
  emit("select", null);
  emit("close");
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h3>Filter by Shoot Status</h3>

      <div class="status-list">
        <div
          v-for="status in statuses"
          :key="status"
          class="status-item"
          :class="{ 'selected': selectedStatus === status }"
          @click="selectStatus(status)"
        >
          {{ getShootStatusDisplayName(status) }}
        </div>
      </div>

      <div class="modal-actions">
        <BaseButton
          v-if="selectedStatus"
          variant="outline"
          @click="clearFilter"
        >
          Clear Filter
        </BaseButton>
        <BaseButton @click="emit('close')">Cancel</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90vw;
  max-width: 400px;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1em;
  text-align: center;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin-bottom: 1.5em;
}

.status-item {
  padding: 1em;
  border-radius: 6px;
  background-color: var(--color-background-soft);
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-item:hover {
  background-color: var(--color-background-mute);
}

.status-item.selected {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1em;
}

.modal-actions button {
  flex: 1;
}
</style>
