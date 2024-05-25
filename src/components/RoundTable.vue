<script setup>
import EndScores from '@/components/EndScores.vue'
import { computed } from "vue";

const props = defineProps({
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

const onTrackFor252 = 84
const colspan = computed(() => (props.endSize * 2) + 2);


</script>

<template>
  <tr v-for="(round, index) in rounds" :key="round.id">
    <EndScores :scores="round.firstEnd" :endSize="endSize" />
    <EndScores :scores="round.secondEnd" :endSize="endSize" />
    <td>{{ round.subTotals.hits }}</td>
    <td
        :class="{onTrack: round.subTotals.totalScore >=onTrackFor252, offTrack: round.subTotals.totalScore > 0 && round.subTotals.totalScore <onTrackFor252}">
      {{ round.subTotals.totalScore }}
    </td>
    <td>{{ round.subTotals.golds }}</td>
    <td v-if="hasX">{{ round.subTotals.X }}</td>
    <td :class="{
      onTrack: index===0 && round.subTotals.runningTotal >= onTrackFor252 || index===1 && round.subTotals.runningTotal >= onTrackFor252*2,
      highlight: index === 2 && subtotals.totalScore >= onTrackFor252*3,
    }">
      {{ round.subTotals.runningTotal }}
    </td>
  </tr>

  <tr class="round-subtotal">
    <td :colspan="colspan"></td>
    <td>{{ subtotals.hits }}</td>
    <td>{{ subtotals.totalScore }}</td>
    <td>{{ subtotals.golds }}</td>
    <td v-if="hasX">{{ subtotals.X }}</td>
    <td>{{ subtotals.totalScore }}</td>
  </tr>
</template>