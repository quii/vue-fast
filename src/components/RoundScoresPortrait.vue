<script setup>
import { computed } from "vue";
import { calculateSubtotals } from "@/domain/scoring/subtotals";
import RoundTablePortrait from "@/components/RoundTablePortrait.vue";
import { calculateDistanceTotals } from "@/domain/scoring/distance_totals";

const props = defineProps({
  scores: {
    required: true
  },
  gameType: {
    required: true
  },
  endSize: {
    required: true
  },
  hasX: {
    default: false
  },
  userProfile: {
    type: Object,
    default: null
  }
});
const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const rounds = computed(() => calculateDistanceTotals(props.scores, props.gameType, props.endSize));
const oneDistanceShoot = computed(() => rounds.value.length === 1);
const colspan = computed(() => props.endSize);
const totalColspan = computed(() => props.endSize === 5 ? 1 : 2);
</script>

<template>
  <div class="table-container">
    <table>
      <tbody>
      <RoundTablePortrait
        v-for="(round, index) in rounds"
        :key="index+'portrait'"
        :subtotals="round.subTotals"
        :rounds="round.roundBreakdown"
        :endSize="endSize"
        :hasX="hasX"
      />
      <tr v-if="!oneDistanceShoot" class="grand-totals-header">
        <td :colSpan="colspan+1">Grand totals</td>
      </tr>
      <tr v-if="!oneDistanceShoot" class="grand-totals">
        <td>Hits</td>
        <td data-test="totalHits">{{ totals.hits }}</td>
        <td>Golds</td>
        <td data-test="totalGolds">{{ totals.golds }}</td>
        <td>Score</td>
        <td :colspan="totalColspan">{{ totals.totalScore }}</td>
      </tr>
      </tbody>
    </table>
  </div>

</template>

<style scoped>

.table-container {
  padding: 0.5em;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

tbody td {
  padding: 0.5em;
  border-bottom: 1px solid var(--color-border-light, rgba(60, 60, 60, 0.1));
}

.grand-totals-header td {
  font-weight: 600;
  border-bottom: none;
  background-color: var(--color-background-soft);
}

.grand-totals td {
  font-weight: 500;
}

.grand-totals td:nth-child(even) {
  font-weight: 600;
}
</style>
