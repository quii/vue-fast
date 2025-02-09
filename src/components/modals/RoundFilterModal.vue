<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import { ref } from "vue";

defineProps(["rounds"]);
const emit = defineEmits(["close", "select"]);

const selectedRound = ref("");

function handleSelect() {
  emit("select", selectedRound.value);
  emit("close");
}
</script>

<template>
  <BaseModal>
    <h2>Filter by Round 🏹</h2>

    <select v-model="selectedRound" class="round-select">
      <option value="">All Rounds</option>
      <option v-for="round in rounds" :key="round" :value="round">
        {{ round }}
      </option>
    </select>

    <div class="button-group">
      <button @click="emit('close')">Cancel</button>
      <button class="primary" @click="handleSelect">Apply Filter</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.round-select {
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
