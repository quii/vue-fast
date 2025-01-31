<template>
  <div v-if="currentSightMark" class="sight-mark-display">
    <div class="sight-mark-container">
      <span class="label">Sight mark ({{ currentSightMark.distance }}{{ currentSightMark.unit }})</span>
      <span class="value">{{ formatVertical(currentSightMark.vertical) }}</span>
    </div>
  </div>
</template>


<script setup>
import { computed } from "vue";
import { useGameTypeStore } from "@/stores/game_type";
import { useSightMarksStore } from "@/stores/sight_marks";

const gameTypeStore = useGameTypeStore();
const sightMarksStore = useSightMarksStore();

const currentSightMark = computed(() => {
  const round = gameTypeStore.currentRound;
  return sightMarksStore.findMarkForDistance(
    round.maxDistanceMetres,
    round.maxDistanceYards
  );
});

function formatVertical(vertical) {
  return `${vertical.major}.${vertical.minor}.${vertical.micro}`;
}
</script>

<style scoped>
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
