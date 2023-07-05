<script setup>
import EndScores from "@/components/EndScores.vue";
import { computed } from "vue";
import { calculateGoldCount, calculateHitsCount, calculateRounds, calculateTotal } from "@/domain/scores";

const props = defineProps({
  scores: {
    required: true,
  }
});

const runningTotal = computed(() => calculateTotal(props.scores));
const totalGolds = computed(() => calculateGoldCount(props.scores));
const totalHits = computed(() => calculateHitsCount(props.scores));
const rounds = computed(() => calculateRounds(props.scores));

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
    <tr v-for="(round, index) in rounds.firstDistance" :key="round.id">
      <EndScores v-bind:scores="round.firstEnd" />
      <EndScores v-bind:scores="round.secondEnd" />
      <td>{{ round.subTotals.hits }}</td>
      <td>{{ round.subTotals.score }}</td>
      <td>{{ round.subTotals.golds }}</td>
      <td :class="{twoFiveTwo: index===2 && round.subTotals.runningTotal>=252}">{{ round.subTotals.runningTotal }}</td>
    </tr>

    <tr class="round-subtotal">
      <td colspan="14"></td>
      <td>{{ rounds.firstDistanceSubtotals.hits }}</td>
      <td>{{ rounds.firstDistanceSubtotals.totalScore }}</td>
      <td>{{ rounds.firstDistanceSubtotals.golds }}</td>
      <td>{{ rounds.firstDistanceSubtotals.totalScore }}</td>
    </tr>

    <tr v-for="round in rounds.secondDistance" :key="round.id">
      <EndScores v-bind:scores="round.firstEnd" />
      <EndScores v-bind:scores="round.secondEnd" />
      <td>{{ round.subTotals.hits }}</td>
      <td>{{ round.subTotals.score }}</td>
      <td>{{ round.subTotals.golds }}</td>
      <td>{{ round.subTotals.runningTotal }}</td>
    </tr>

    <tr class="round-subtotal">
      <td colspan="14"></td>
      <td>{{ rounds.secondDistanceSubtotals.hits }}</td>
      <td>{{ rounds.secondDistanceSubtotals.totalScore }}</td>
      <td>{{ rounds.secondDistanceSubtotals.golds }}</td>
      <td>{{ rounds.secondDistanceSubtotals.totalScore }}</td>
    </tr>

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
.grand-totals, td:first-child {
    border: none;
}

.grand-totals td, .round-subtotal td {
    font-weight: bold;
    color: var(--color-heading);
}

.twoFiveTwo {
    color: gold;
    background: #2c3e50;
    font-weight: bold;
}
</style>
