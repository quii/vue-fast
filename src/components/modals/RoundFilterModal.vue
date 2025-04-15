<script setup>
import BaseModal from "@/components/modals/BaseModal.vue";
import { getRoundDetails } from "@/domain/scoring/round/round_details";
import { formatRoundName } from "@/domain/scoring/round/formatting.js";

defineProps(["rounds"]);
const emit = defineEmits(["close", "select"]);

function handleSelect(round) {
  emit("select", round);
  emit("close");
}

function getRoundColorScheme(roundName) {
  if (!roundName) return "";
  const details = getRoundDetails(roundName);
  return details ? details.colorScheme : "";
}
</script>

<template>
  <BaseModal title="Filter by Round">
    <div class="round-buttons">
      <button
        class="round-button all-button"
        @click="handleSelect('')"
      >
        All Rounds
      </button>

      <button
        v-for="round in rounds"
        :key="round"
        class="round-button"
        @click="handleSelect(round)"
      >
        <div
          class="round-indicator"
          :class="getRoundColorScheme(round)"
        ></div>
        <span class="round-name">{{ formatRoundName(round) }}</span>
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.round-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.round-button {
  padding: 0.75rem 0.5rem 0.75rem 0;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease;
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 2.5rem;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  text-align: left;
}

.round-indicator {
  width: 8px;
  height: 100%;
  min-height: 2.5rem;
  margin-right: 0.75rem;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.round-name {
  font-weight: 500;
}

.round-button:active {
  transform: scale(0.98);
}

.all-button {
  justify-content: center;
  text-align: center;
  padding: 0.75rem 1rem;
}

/* Color schemes copied from RoundCard.vue */
.imperial {
  background-color: hsla(207, 85%, 65%, 1);
}

.metric {
  background-color: hsla(3, 84%, 65%, 1);
}
</style>
