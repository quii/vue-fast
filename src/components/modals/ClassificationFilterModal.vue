<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import { classificationList, classificationMap } from "@/domain/scoring/classificationList";

const emit = defineEmits(["close", "select"]);

const filteredClassifications = classificationList.filter(c => c !== "PB");

function handleSelect(classification) {
  emit("select", classification);
  emit("close");
}

function getFullName(classification) {
  return classificationMap[classification] || classification;
}
</script>

<template>
  <BaseModal title="Filter by Classification">
    <div class="classification-buttons">
      <button
        class="classification-button all-button"
        @click="handleSelect('')"
      >
        All Classifications
      </button>

      <button
        v-for="classification in filteredClassifications"
        :key="classification"
        :class="['classification-button', classification]"
        @click="handleSelect(classification)"
      >
        <span class="classification-code">{{ classification }}</span>
        <span class="classification-name">{{ getFullName(classification) }}</span>
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.classification-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.classification-button {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center; /* Center align all buttons */
  min-height: 2.5rem;
  text-align: center; /* Center text alignment */
}

.classification-code {
  margin-right: 0.75rem;
  font-weight: bold;
}

.classification-name {
  font-weight: normal;
}

.classification-button:active {
  transform: scale(0.98);
}

.all-button {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

/* Classification colors - copied from HistoryCard.vue */
.B1 {
  background-color: hsl(3, 84%, 36%);
  color: white;
}

.B2 {
  background-color: hsl(3, 84%, 46%);
  color: white;
}

.B3 {
  background-color: hsl(3, 84%, 56%);
  color: white;
}

.A3 {
  background-color: hsl(207, 85%, 90%);
  color: #061345;
}

.A2 {
  background-color: hsl(207, 85%, 80%);
  color: #061345;
}

.A1 {
  background-color: hsl(207, 85%, 72%);
  color: #061345;
}

.MB, .GMB, .EMB {
  background-color: rebeccapurple;
  color: white;
}
</style>

