<script setup>
import { computed } from "vue";
import RoundTable from "@/components/RoundTable.vue";
import { calculateSubtotals } from "@/domain/scoring/subtotals";
import { calculateDistanceTotals } from "@/domain/scoring/distance_totals";
import ClassificationDetails from "@/components/ClassificationDetails.vue";

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
const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const rounds = computed(() => calculateDistanceTotals(props.scores, props.gameType, props.endSize));
const colspan = computed(() => (props.endSize * 2) + 2);
const oneDistanceShoot = computed(() => rounds.value.length === 1);

</script>

<template>
  <table>
    <thead>
      <tr>
        <th :colSpan="endSize">🎯 Scores</th>
        <th>E/T</th>
        <th :colSpan="endSize">🎯 Scores</th>
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
  <ClassificationDetails :end-size="props.endSize" :game-type="props.gameType"
                         :scores="props.scores"></ClassificationDetails>
</template>

<style scoped>
table {
  table-layout: fixed;
}
.grand-totals,
td:first-child {
  border: none;
}
</style>
