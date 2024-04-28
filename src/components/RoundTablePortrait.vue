<script setup>
import EndScores from "@/components/EndScores.vue";
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
});

const ends = computed(() => {
  return props.rounds.reduce((acc, cur) => {
    return [...acc, cur.firstEnd, cur.secondEnd];
  }, []);

});

</script>

<template>
  <tr v-for="(end, id) in ends" :key="id">
    <EndScores :scores="end" :endSize="endSize" />
  </tr>

  <tr v-if="ends.length > 0" class="round-subtotal">
    <td>Hits</td>
    <td>{{ subtotals.hits }}</td>
    <td>Golds</td>
    <td>{{ subtotals.golds }}</td>
    <td>Score</td>
    <td colspan="2">{{ subtotals.totalScore }}</td>
  </tr>
</template>