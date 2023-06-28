<script setup>
import End from "@/components/End.vue";

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
      <End v-bind:scores="round.firstEnd" />
      <End v-bind:scores="round.secondEnd" />
      <td>{{ round.subTotals.hits }}</td>
      <td>{{ round.subTotals.score }}</td>
      <td>{{ round.subTotals.golds }}</td>
      <td>{{ round.subTotals.runningTotal }}</td>
    </tr>
    <tr class="round-subtotal">
      <td colspan="18">I don't know what goes here</td>
    </tr>
    <tr v-for="round in rounds.secondDistance" :key="round.id">
      <End v-bind:scores="round.firstEnd" />
      <End v-bind:scores="round.secondEnd" />
      <td>{{ round.subTotals.hits }}</td>
      <td>{{ round.subTotals.score }}</td>
      <td>{{ round.subTotals.golds }}</td>
      <td>{{ round.subTotals.runningTotal }}</td>
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
table {
    text-align: center;
}

.round-subtotal {
    text-align: right;
}

.grand-totals, td:first-child {
    border: none;
}

.grand-totals {
    font-weight: bold;
}
</style>
