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
  },
  distance: {
    default: null
  },
  unit: {
    default: null
  },
  isOneDistanceShoot: {
    default: false
  }
})

const colspan = computed(() => (props.endSize * 2) + 1)
const totalLabel = computed(() => props.isOneDistanceShoot ? 'Totals' : 'Subtotals')
</script>

<template>
  <tr v-for="round in rounds" :key="round.id" class="score-row">
    <EndScores :scores="round.firstEnd" :endSize="endSize" />
    <EndScores :scores="round.secondEnd" :endSize="endSize" />
    <td class="stat-cell">{{ round.subTotals.hits }}</td>
    <td class="stat-cell" :class="{onTrack: false, offTrack: false}">
      {{ round.subTotals.totalScore }}
    </td>
    <td class="stat-cell">{{ round.subTotals.golds }}</td>
    <td v-if="hasX" class="stat-cell">{{ round.subTotals.X }}</td>
    <td class="running-total" :class="{
      onTrack: false,
      highlight: false,
    }">
      {{ round.subTotals.runningTotal }}
    </td>
  </tr>

  <tr class="round-subtotal">
    <td :colspan="colspan" class="distance">{{ totalLabel }} for {{ distance }}{{ unit }}</td>
    <td></td>
    <td data-test="subTotalHits">{{ subtotals.hits }}</td>
    <td data-test="subTotalScore">{{ subtotals.totalScore }}</td>
    <td data-test="subTotalGolds">{{ subtotals.golds }}</td>
    <td v-if="hasX">{{ subtotals.X }}</td>
    <td>{{ subtotals.totalScore }}</td>
  </tr>
</template>

<style scoped>
.score-row td {
  padding: 0.5em;
  vertical-align: middle;
}

.stat-cell {
  text-align: center;
  font-weight: 500;
}

.running-total {
  text-align: center;
  font-weight: 600;
  border-left: 1px solid var(--color-border-light, rgba(60, 60, 60, 0.1));
}

.round-subtotal {
  background-color: var(--color-background-mute);
}

.round-subtotal td {
  padding: 0.5em;
  text-align: center;
  font-weight: 600;
}

.onTrack {
  color: green;
}

.offTrack {
  color: red;
}

.highlight {
  background-color: rgba(255, 215, 0, 0.2);
}

td.distance {
  text-align: right;
}
</style>