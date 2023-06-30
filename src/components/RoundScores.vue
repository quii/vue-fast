<script setup>
import EndScores from "@/components/EndScores.vue";

defineProps({
  rounds: {
    required: true
  },
  runningTotal: {
    required: true
  },
  totalGolds: {
    required: true
  },
  totalHits: {
    required: true
  }
});

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
    <tr v-for="round in rounds.firstDistance" :key="round.id">
      <EndScores v-bind:scores="round.firstEnd" />
      <EndScores v-bind:scores="round.secondEnd" />
      <td>{{ round.subTotals.hits }}</td>
      <td>{{ round.subTotals.score }}</td>
      <td>{{ round.subTotals.golds }}</td>
      <td>{{ round.subTotals.runningTotal }}</td>
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
      <td>{{ totalHits }}</td>
      <td>{{ runningTotal }}</td>
      <td>{{ totalGolds }}</td>
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
</style>
