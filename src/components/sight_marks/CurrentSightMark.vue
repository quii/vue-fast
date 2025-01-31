<template>
  <div v-if="currentMarks.length" class="sight-marks-display">
    <div v-for="mark in currentMarks" :key="mark.id" class="sight-mark-container">
      <span class="label">
        sight mark ({{ mark.distance }}{{ mark.unit }})
        <span v-if="mark.label" class="mark-label">{{ mark.label }}</span>
      </span>
      <span class="value">{{ formatVertical(mark.vertical) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGameTypeStore } from "@/stores/game_type";
import { useSightMarksStore } from "@/stores/sight_marks";

const gameTypeStore = useGameTypeStore();
const sightMarksStore = useSightMarksStore();

const currentMarks = computed(() => {
  const round = gameTypeStore.currentRound;
  return sightMarksStore.findMarksForDistance(
    round.maxDistanceMetres,
    round.maxDistanceYards
  )
})

function formatVertical(vertical) {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}
</script>

<style scoped>
.mark-label {
  font-size: 0.8rem;
  font-style: italic;
  margin-left: 0.5rem;
}

.sight-mark-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem;
}

.value {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
