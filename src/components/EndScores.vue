<script setup>
import { scoresPerEnd } from "@/domain/scores";
import { calculateTotal } from "@/domain/subtotals";
import {computed} from "vue";

const props = defineProps({
  scores: {
    type: Array,
    required: true
  }
});

const onTrackFor252 = 42

const total = computed(() => calculateTotal(props.scores))
</script>

<template>
  <td :class="'score' + scores[i - 1]" class="score" v-for="i in scoresPerEnd" :key="i">
    {{ scores[i - 1] }}
  </td>
  <td :class="{onTrack: total >=onTrackFor252, offTrack: total > 0 && total <onTrackFor252}">{{ total }}</td>
</template>

<style scoped>
.score {
  font-weight: bold;
}
</style>
