<script setup>
import { computed } from "vue";
import RoundTable from "@/components/RoundTable.vue";
import { calculateSubtotals } from "@/domain/scoring/subtotals";
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
const colspan = computed(() => (props.endSize * 2) + 2);
const oneDistanceShoot = computed(() => rounds.value.length === 1);
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
      <tr>
        <th :colSpan="endSize"></th>
        <th>E/T</th>
        <th :colSpan="endSize"></th>
        <th>E/T</th>
        <th>H</th>
        <th>S</th>
        <th>G</th>
        <th v-if="hasX">X</th>
        <th>R/T</th>
      </tr>
      </thead>
      <tbody>
      <RoundTable
        v-for="(round, index) in rounds"
        :key="index"
        :subtotals="round.subTotals"
        :rounds="round.roundBreakdown"
        :endSize="endSize"
        :hasX="hasX"
        :distance="round.distance"
        :unit="round.unit"
      />
      <tr v-if="!oneDistanceShoot" class="grand-totals">
        <td :colspan="colspan"></td>
        <td data-test="totalHits">{{ totals.hits }}</td>
        <td data-test="totalScore">{{ totals.totalScore }}</td>
        <td data-test="totalGolds">{{ totals.golds }}</td>
        <td v-if="hasX" data-test="totalXs">{{ totals.X }}</td>
        <td>{{ totals.totalScore }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>

.table-container {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  table-layout: fixed;
}

tbody td {
  padding: 0.5em;
  border-bottom: 1px solid var(--color-border-light, rgba(60, 60, 60, 0.1));
}

.grand-totals td {
  font-weight: 600;
  background-color: var(--color-background-mute);
  font-size: 1.1rem;
}

.grand-totals td:first-child {
  border: none;
}
</style>
