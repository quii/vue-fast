<script setup>
import { calculateTotal } from "@/domain/subtotals";
import {computed} from "vue";
import { convertToValues } from "@/domain/scores";
import { useGameTypeStore } from "@/stores/game_type";

const props = defineProps({
  scores: {
    type: Array,
    required: true
  },
  endSize: {
    type: Number,
    required: true
  },
});

const gameTypeStore = useGameTypeStore();

function scoreButtonClass(score) {
  if (gameTypeStore.type === "worcester") {
    if (score === 5) {
      return {
        "worcester5": true
      };
    }
    return {
      "worcesterRest": true
    };
  }
  return {
    [`score${score}`]: true
  };
}

const onTrackFor252 = 42
const total = computed(() => calculateTotal(convertToValues(props.scores, gameTypeStore.type)));
const onTrack = computed(() => total.value >=onTrackFor252)
const offTrack = computed(() => total.value > 0 && total.value < onTrackFor252)

</script>

<template>
  <td :class="scoreButtonClass(scores[i - 1])" class="score" v-for="i in endSize" :key="i">
    {{ scores[i - 1] }}
  </td>
  <td :class="{onTrack, offTrack}">{{ total }}</td>
</template>

<style scoped>
.score {
  font-weight: bold;
}
</style>
