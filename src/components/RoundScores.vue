<script setup>
import { computed } from "vue";
import RoundTable from "@/components/RoundTable.vue";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateRounds } from "@/domain/rounds";

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
  }
});
const totals = computed(() => calculateSubtotals(props.scores))
const rounds = computed(() => calculateRounds(props.scores, props.gameType, props.endSize));
</script>

<template>
  <table>
    <thead>
      <tr>
        <th :colSpan="endSize">🎯 scores</th>
        <th>E/T</th>
        <th :colSpan="endSize">🎯 scores</th>
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
      />
      <tr class="grand-totals">
        <td colspan="14"></td>
        <td data-test="totalHits">{{ totals.hits }}</td>
        <td data-test="totalScore">{{ totals.totalScore }}</td>
        <td data-test="totalGolds">{{ totals.golds }}</td>
        <td v-if="hasX" data-test="totalXs">{{ totals.X }}</td>
        <td>{{ totals.totalScore }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  table-layout: fixed;
}
.grand-totals,
td:first-child {
  border: none;
}

.grand-totals td,
.round-subtotal td {
  font-weight: bold;
  color: var(--color-heading);
}
</style>
