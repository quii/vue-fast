<script setup>
import { computed } from "vue";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateRounds } from "@/domain/rounds";
import RoundTablePortrait from "@/components/RoundTablePortrait.vue";

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
const totals = computed(() => calculateSubtotals(props.scores));
const rounds = computed(() => calculateRounds(props.scores, props.gameType, props.endSize));
</script>

<template>
  <table>
    <thead>
    <tr>
      <th :colSpan="endSize">🎯 scores</th>
      <th>E/T</th>
    </tr>
    </thead>
    <tbody>
    <RoundTablePortrait
      v-for="(round, index) in rounds"
      :key="index"
      :subtotals="round.subTotals"
      :rounds="round.roundBreakdown"
      :endSize="endSize"
      :hasX="hasX"
    />
    <tr>
      <td>Hits</td>
      <td data-test="totalHits">{{ totals.hits }}</td>
      <td>Golds</td>
      <td data-test="totalGolds">{{ totals.golds }}</td>
      <td>Total</td>
      <td colspan="2">{{ totals.totalScore }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  table-layout: fixed;
}

.grand-totals td,
.round-subtotal td {
  font-weight: bold;
  color: var(--color-heading);
}
</style>
