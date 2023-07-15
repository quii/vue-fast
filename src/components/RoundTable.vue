<script setup>
import EndScores from '@/components/EndScores.vue'

defineProps({
  rounds: {
    required: true
  },
  subtotals: {
    required: true
  }
})
</script>

<template>
  <tr v-for="(round, index) in rounds" :key="round.id">
    <EndScores v-bind:scores="round.firstEnd" />
    <EndScores v-bind:scores="round.secondEnd" />
    <td>{{ round.subTotals.hits }}</td>
    <td>{{ round.subTotals.totalScore }}</td>
    <td>{{ round.subTotals.golds }}</td>
    <td :class="{ twoFiveTwo: index === 2 && round.subTotals.runningTotal >= 252 }">
      {{ round.subTotals.runningTotal }}
    </td>
  </tr>

  <tr class="round-subtotal">
    <td colspan="14"></td>
    <td>{{ subtotals.hits }}</td>
    <td>{{ subtotals.totalScore }}</td>
    <td>{{ subtotals.golds }}</td>
    <td>{{ subtotals.totalScore }}</td>
  </tr>
</template>

<style scoped>
.twoFiveTwo {
  color: gold;
  background: #2c3e50;
  font-weight: bold;
}
</style>
