<script setup>
import { computed } from "vue";
import { calculateSubtotals } from "@/domain/subtotals";
import RoundTablePortrait from "@/components/RoundTablePortrait.vue";
import ClassificationDetails from "@/components/ClassificationDetails.vue";
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
const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const rounds = computed(() => calculateRounds(props.scores, props.gameType, props.endSize));
const oneDistanceShoot = computed(() => rounds.value.length === 1);
const colspan = computed(() => props.endSize);

const totalColspan = computed(() => props.endSize === 5 ? 1 : 2);

</script>

<template>
  <table>
    <thead>
    <tr>
      <th :colSpan="colspan">🎯 Scores</th>
      <th>E/T</th>
    </tr>
    </thead>
    <tbody>
    <RoundTablePortrait
      v-for="(round, index) in rounds"
      :key="index+'portrait'"
      :subtotals="round.subTotals"
      :rounds="round.roundBreakdown"
      :endSize="endSize"
      :hasX="hasX"
    />
    <tr v-if="!oneDistanceShoot" class="grand-totals">
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
  <ClassificationDetails :end-size="props.endSize" :game-type="props.gameType"
                         :scores="props.scores"></ClassificationDetails>
</template>

<style scoped>
table {
  table-layout: fixed;
}
</style>
