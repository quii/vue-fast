<script setup>
import End from "@/components/End.vue";

defineProps({
  rounds: {
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
    <tr v-for="round in rounds" :key="round.id">
      <End v-bind:scores="round.firstEnd" />
      <End v-bind:scores="round.secondEnd" />
      <td>{{ round.subTotals.hits }}</td>
      <td>{{ round.subTotals.score }}</td>
      <td>{{ round.subTotals.golds }}</td>
      <td>{{ round.subTotals.runningTotal }}</td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>
