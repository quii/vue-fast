<script setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { createClassificationCalculator } from "@/domain/classification";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/rounds";
import {gameTypeConfig} from "@/domain/game_types";
import {convertToValue} from "@/domain/scores";
import { useHistoryStore } from "@/stores/history";

const props = defineProps({
  scores: {
    required: true
  },
  gameType: {
    required: true
  },
  endSize: {
    required: true
  }
});

const userStore = useUserStore();
const historyStore = useHistoryStore();
const personalBest = computed(()=> historyStore.personalBest(props.gameType))
const classificationCalculator = computed(() => createClassificationCalculator(
  props.gameType,
  userStore.user.gender,
  userStore.user.ageGroup,
  userStore.user.bowType,
  personalBest.value
));

const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const averageScoresPerEnd = computed(() => calculateAverageScorePerEnd(props.scores, props.endSize, props.gameType));
const arrowsRemaining = computed(() => gameTypeConfig[props.gameType].maxArrows-props.scores.length)
const maxPossibleScore = computed(() => totals.value.totalScore + (arrowsRemaining.value*convertToValue(gameTypeConfig[props.gameType].scores[0])));

const availableClassifications = computed(() => {
  return classificationCalculator.value?.(
      totals.value.totalScore,
      averageScoresPerEnd.value
  );
});
</script>

<template>
  <details claas="dropdown">
    <summary>View Classification Calculation</summary>
    <div v-if="availableClassifications">
    <table>
      <thead>
      <tr>
        <th>Classification</th>
        <th>Required score</th>
        <th>Avg. per end</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="index+'class'" v-for="(classification, index) in availableClassifications"
          :class="{ achieved: classification.achieved, failed: classification.score>maxPossibleScore }"

      >
        <td><span v-if="classification.achieved">✅ </span>{{ classification.name }}</td>
        <td>{{ classification.score }} <span class="short"
                                             v-if="classification.shortBy"> (-{{ classification.shortBy }})</span></td>
        <td>{{ classification.scorePerEnd }} <span class="avgOnTrack"
                                                   v-if="classification.perEndDiff>=0">(+{{ classification.perEndDiff
          }})</span><span
          class="avgOffTrack" v-if="classification.perEndDiff<0">({{ classification.perEndDiff }})</span></td>
      </tr>
      <tr>
        <td colspan="2">Arrows remaining</td>
        <td>{{arrowsRemaining}}</td>
      </tr>
      <tr>
        <td colspan="2">Max possible score</td>
        <td>{{maxPossibleScore}}</td>
      </tr>
      </tbody>
    </table>
  </div>
  </details>
</template>


<style scoped>
.achieved, .avgOnTrack {
  color: green;
}

.short, .avgOffTrack {
  color: red;
}

.failed {
  text-decoration: line-through;
}
</style>
