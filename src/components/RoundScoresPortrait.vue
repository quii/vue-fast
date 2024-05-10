<script setup>
import { computed } from "vue";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateRounds } from "@/domain/rounds";
import RoundTablePortrait from "@/components/RoundTablePortrait.vue";
import { useUserStore } from "@/stores/user";
import { newClassificationCalculator } from "@/domain/classification";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig } from "@/domain/game_types";

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
const userStore = useUserStore();
const history = useHistoryStore();
const pb = computed(() => history.personalBest(props.gameType));
const pointsPerEnd = computed(() => history.pointsPerEnd(props.gameType, gameTypeConfig[props.gameType].maxArrows, props.endSize));

const classification = computed(() => {
  const calculator = newClassificationCalculator(props.gameType, userStore.user.gender, userStore.user.ageGroup, userStore.user.bowType);
  if (calculator) {
    return calculator(totals.value.totalScore);
  }
  return undefined;
});
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
      :key="index+'portrait'"
      :subtotals="round.subTotals"
      :rounds="round.roundBreakdown"
      :endSize="endSize"
      :hasX="hasX"
    />
    <tr class="grand-totals">
      <td colspan="7">Grand totals</td>
    </tr>
    <tr class="grand-totals">
      <td>Hits</td>
      <td data-test="totalHits">{{ totals.hits }}</td>
      <td>Golds</td>
      <td data-test="totalGolds">{{ totals.golds }}</td>
      <td>Score</td>
      <td colspan="2">{{ totals.totalScore }}</td>
    </tr>
    </tbody>
  </table>
  <div v-if="classification">
    <table>
      <thead>
      <tr>
        <th colspan="3">Classification</th>
        <th v-if="pb" rowspan="2">Personal best</th>
      </tr>
      <tr>
        <th>Current</th>
        <th>Next</th>
        <th>Short by</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>{{ classification.classification }}</td>
        <td>{{ classification.next }}</td>
        <td>{{ classification.shortBy }}</td>
        <td v-if="pb">{{ pb }}<br />Avg. {{ pointsPerEnd }}/end</td>
      </tr>
      </tbody>
    </table>
  </div>
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
