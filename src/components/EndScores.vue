<script setup>
import { calculateTotal } from "@/domain/subtotals";
import {computed} from "vue";
import { scoresPerEnd } from "@/domain/rounds";
import { convertToValues } from "@/domain/scores";

const props = defineProps({
  scores: {
    type: Array,
    required: true
  }
});

const onTrackFor252 = 42
const total = computed(() => calculateTotal(convertToValues(props.scores)));
const onTrack = computed(() => total.value >=onTrackFor252)
const offTrack = computed(() => total.value > 0 && total.value < onTrackFor252)

</script>

<template>
  <td :class="'score' + scores[i - 1]" class="score" v-for="i in scoresPerEnd" :key="i">
    {{ scores[i - 1] }}
  </td>
  <td :class="{onTrack, offTrack}">{{ total }}</td>
</template>

<style scoped>
.score {
  font-weight: bold;
}
</style>
