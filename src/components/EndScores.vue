<script setup>
import { scoresPerEnd } from "@/domain/scores";
import { calculateTotal } from "@/domain/subtotals";

defineProps({
  scores: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <td :class="'score' + scores[i - 1]" class="score" v-for="i in scoresPerEnd" :key="i">
    {{ scores[i - 1] }}
  </td>
  <td class="et">{{ calculateTotal(scores) }}</td>
</template>

<style scoped>
.et {
  font-weight: bold;
}

.score {
  font-weight: bold;
}
</style>
