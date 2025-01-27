<script setup>
import BaseModal from "./BaseModal.vue";
import { ref } from "vue";
import { classificationList } from "@/domain/classificationList";

const emit = defineEmits(["close", "select"]);
const selectedClassification = ref("");

function handleSelect() {
  emit("select", selectedClassification.value);
  emit("close");
}
</script>

<template>
  <BaseModal>
    <h2>Filter by Classification 🏅</h2>

    <select v-model="selectedClassification" class="classification-select">
      <option value="">All Classifications</option>
      <option v-for="classification in classificationList" :key="classification" :value="classification">
        {{ classification }}
      </option>
    </select>

    <div class="button-group">
      <button @click="emit('close')">Cancel</button>
      <button class="primary" @click="handleSelect">Apply Filter</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.classification-select {
  width: 100%;
  margin: 1rem 0;
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
