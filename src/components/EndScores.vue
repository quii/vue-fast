<script setup>
import { calculateTotal } from "@/domain/scoring/subtotals";
import { computed } from "vue";
import { convertToValues } from "@/domain/scoring/scores";
import { useGameTypeStore } from "@/stores/game_type";
import { useUserStore } from "@/stores/user";
import { calculateIfArcherIsOnTrackForNextClassification } from "@/domain/scoring/classification";

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
const userStore = useUserStore();

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

const total = computed(() => calculateTotal(convertToValues(props.scores, gameTypeStore.type)));


const userDetailsExist = computed(() =>
  userStore.user.gender &&
  userStore.user.ageGroup &&
  userStore.user.bowType &&
  userStore.user.classification
);

const onTrack = computed(() => {
  if (!userDetailsExist.value) {
    return null;
  }
  return calculateIfArcherIsOnTrackForNextClassification(
    total.value,
    userStore.user.classification,
    gameTypeStore.type,
    userStore.user.gender,
    userStore.user.ageGroup,
    userStore.user.bowType
  );
});

const offTrack = computed(() => onTrack.value === false);

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
