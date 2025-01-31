<template>
  <div v-if="currentMarks.length" class="sight-marks-display">
    <!-- Single mark view -->
    <div v-if="currentMarks.length === 1" class="sight-mark-container">
      <span class="label">
        Sight mark ({{ currentMarks[0].distance }}{{ currentMarks[0].unit }})
        <span v-if="currentMarks[0].label" class="mark-label">{{ currentMarks[0].label }}</span>
      </span>
      <span class="value">{{ formatVertical(currentMarks[0].vertical) }}</span>
    </div>

    <!-- Multiple marks table view -->
    <table v-else>
      <thead>
      <tr>
        <th>Distance</th>
        <th>Height</th>
        <th>Note</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="mark in currentMarks" :key="mark.id">
        <td>{{ mark.distance }}{{ mark.unit }}</td>
        <td>{{ formatVertical(mark.vertical) }}</td>
        <td v-if="mark.label" class="mark-label">{{ mark.label }}</td>
      </tr>
      </tbody>
    </table>
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
  let marks = [];

  // Get marks for max distance
  const maxDistanceMarks = sightMarksStore.findMarksForDistance(
    round.maxDistanceMetres,
    round.maxDistanceYards
  )
  marks.push(...maxDistanceMarks);

  // Get marks for other distances if they exist
  if (round.otherDistancesYards) {
    round.otherDistancesYards.forEach(distance => {
      const otherMarks = sightMarksStore.findMarksForDistance(
        null,
        distance
      );
      marks.push(...otherMarks);
    });
  }

  if (round.otherDistancesMetres) {
    round.otherDistancesMetres.forEach(distance => {
      const otherMarks = sightMarksStore.findMarksForDistance(
        distance,
        null
      );
      marks.push(...otherMarks);
    });
  }

  return marks;
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
