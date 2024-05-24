<script setup>
import EndScores from '@/components/EndScores.vue'

defineProps({
  rounds: {
    required: true
  },
  subtotals: {
    required: true
  },
  hasX: {
    default: false
  },
  endSize: {
    required: true
  }
})

</script>

<template>
  <tr v-for="round in rounds" :key="round.id">
    <EndScores :scores="round.firstEnd" :endSize="endSize" />
    <EndScores :scores="round.secondEnd" :endSize="endSize" />
    <td>{{ round.subTotals.hits }}</td>
    <td>{{ round.subTotals.totalScore }}</td>
    <td>{{ round.subTotals.golds }}</td>
    <td v-if="hasX">{{ round.subTotals.X }}</td>
    <td>
      {{ round.subTotals.runningTotal }}
    </td>
  </tr>

  <tr class="round-subtotal">
    <td colspan="14"></td>
    <td>{{ subtotals.hits }}</td>
    <td :class="{highlight: subtotals.totalScore>=252}">{{ subtotals.totalScore }}</td>
    <td>{{ subtotals.golds }}</td>
    <td v-if="hasX">{{ subtotals.X }}</td>
    <td>{{ subtotals.totalScore }}</td>
  </tr>
</template>