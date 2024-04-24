<script setup>
import { computed } from "vue";
import RoundTable from "@/components/RoundTable.vue";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateRounds } from "@/domain/rounds";
import { useScreenOrientation } from "@vueuse/core";

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

const {
  orientation
} = useScreenOrientation();
</script>

<template>
  <table>
    <thead>
      <tr>
        <th :colSpan="endSize">🎯 scores</th>
        <th>E/T</th>
        <th :colSpan="endSize">🎯 scores</th>
        <th>E/T</th>
        <th v-if="orientation==='landscape-primary'">H</th>
        <th v-if="orientation==='landscape-primary'">S</th>
        <th v-if="orientation==='landscape-primary'">G</th>
        <th v-if="orientation==='landscape-primary' && hasX">X</th>
        <th v-if="orientation==='landscape-primary'">R/T</th>
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
      <tr v-if="orientation==='landscape-primary'" class="grand-totals">
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
