<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import { ref } from "vue";

const emit = defineEmits(["close", "select"]);
const startDate = ref("");
const endDate = ref(new Date().toISOString().split("T")[0]);

function handleSelect() {
  emit("select", { startDate: startDate.value, endDate: endDate.value });
  emit("close");
}
</script>

<template>
  <BaseModal>
    <h2>Filter by Date Range 📅</h2>

    <div class="date-inputs">
      <div class="input-group">
        <label for="start-date">From</label>
        <input type="date" id="start-date" v-model="startDate">
      </div>

      <div class="input-group">
        <label for="end-date">To</label>
        <input type="date" id="end-date" v-model="endDate">
      </div>
    </div>

    <div class="button-group">
      <button @click="emit('close')">Cancel</button>
      <button class="primary" @click="handleSelect">Apply Filter</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

input {
  padding: 0.5rem;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
  border-radius: 6px;
  cursor: pointer;
}

button.primary {
  background: #4CAF50;
  color: white;
  border: none;
}
</style>
