<script setup>
import EndScores from "@/components/EndScores.vue";
import { computed } from "vue";

const props = defineProps({
  rounds: {
    required: true
  },
  subtotals: {
    required: true
  },
  hasX: {
    default: false
  },
  endSize: {
    required: true
  },
  distance: {
    default: null
  },
  unit: {
    default: null
  }
});

const ends = computed(() => {
  return props.rounds.reduce((acc, cur) => {
    return [...acc, cur.firstEnd, cur.secondEnd];
  }, []);
});

const totalColspan = computed(() => props.endSize === 5 ? 1 : 2);

</script>

<template>
  <!-- Add a distance header if distance is available -->
  <tr v-if="distance !== null" class="distance-header">
    <td :colSpan="endSize+1">{{ distance }}{{ unit }}</td>
  </tr>
  <tr v-for="(end, id) in ends" :key="id">
    <EndScores :scores="end" :endSize="endSize" />
  </tr>

  <tr v-if="ends.length > 0" class="round-subtotal">
    <td>Hits</td>
    <td data-test="subTotalHits">{{ subtotals.hits }}</td>
    <td>Golds</td>
    <td data-test="subTotalGolds">{{ subtotals.golds }}</td>
    <td>Score</td>
    <td data-test="subTotalScore" :colspan="totalColspan">{{ subtotals.totalScore }}</td>
  </tr>
</template>

<style scoped>
.distance-header td {
  font-weight: 600;
  background-color: var(--color-background-soft);
  text-align: center;
  font-size: 0.8rem;
}
</style>