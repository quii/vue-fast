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

const colspan = computed(() => (props.endSize * 2) + 2);


</script>

<template>
  <tr v-for="round in rounds" :key="round.id">
    <EndScores :scores="round.firstEnd" :endSize="endSize" />
    <EndScores :scores="round.secondEnd" :endSize="endSize" />
    <td>{{ round.subTotals.hits }}</td>
    <td
      :class="{onTrack: false, offTrack: false}">
      {{ round.subTotals.totalScore }}
    </td>
    <td>{{ round.subTotals.golds }}</td>
    <td v-if="hasX">{{ round.subTotals.X }}</td>
    <td :class="{
      onTrack: false,
      highlight: false,
    }">
      {{ round.subTotals.runningTotal }}
    </td>
  </tr>

  <tr class="round-subtotal">
    <td :colspan="colspan"></td>
    <td data-test="subTotalHits">{{ subtotals.hits }}</td>
    <td>{{ subtotals.totalScore }}</td>
    <td data-test="subTotalGolds">{{ subtotals.golds }}</td>
    <td v-if="hasX">{{ subtotals.X }}</td>
    <td data-test="subTotalScore">{{ subtotals.totalScore }}</td>
  </tr>
</template>