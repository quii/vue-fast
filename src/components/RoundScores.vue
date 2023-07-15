<script setup>
import { computed } from 'vue'
import {
  calculateGoldCount,
  calculateHitsCount,
  calculateRounds,
  calculateTotal
} from '@/domain/scores'
import RoundTable from '@/components/RoundTable.vue'

const props = defineProps({
  scores: {
    required: true
  },
  gameType: {
    required: true
  }
})

const runningTotal = computed(() => calculateTotal(props.scores))
const totalGolds = computed(() => calculateGoldCount(props.scores))
const totalHits = computed(() => calculateHitsCount(props.scores))
const rounds = computed(() => calculateRounds(props.scores, props.gameType))
</script>

<template>
  <table>
    <thead>
      <tr>
        <th className="spanningColumn" colSpan="6">🎯 scores</th>
        <th>E/T</th>
        <th className="spanningColumn" colSpan="6">🎯 scores</th>
        <th>E/T</th>
        <th>H</th>
        <th>S</th>
        <th>G</th>
        <th>R/T</th>
      </tr>
    </thead>
    <tbody>
      <RoundTable
        v-for="(round, index) in rounds"
        :key="index"
        :subtotals="round.subTotals"
        :rounds="round.roundBreakdown"
      />
      <tr class="grand-totals">
        <td colspan="14"></td>
        <td data-test="totalHits">{{ totalHits }}</td>
        <td data-test="totalScore">{{ runningTotal }}</td>
        <td data-test="totalGolds">{{ totalGolds }}</td>
        <td>{{ runningTotal }}</td>
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
