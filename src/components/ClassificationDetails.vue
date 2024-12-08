<script setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { createClassificationCalculator } from "@/domain/classification";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/rounds";
import { gameTypeConfig } from "@/domain/game_types";
import { convertToValue } from "@/domain/scores";
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
const personalBest = computed(() => historyStore.personalBest(props.gameType));
const classificationCalculator = computed(() => createClassificationCalculator(
  props.gameType,
  userStore.user.gender,
  userStore.user.ageGroup,
  userStore.user.bowType,
  personalBest.value
));

const userDetailsSaved = computed(() => userStore.user.gender && userStore.user.ageGroup && userStore.user.bowType);
const hasStarted = computed(() => props.scores.length > 0);

const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const averageScoresPerEnd = computed(() => calculateAverageScorePerEnd(props.scores, props.endSize, props.gameType));
const arrowsRemaining = computed(() => gameTypeConfig[props.gameType].maxArrows - props.scores.length);
const maxPossibleScore = computed(() => totals.value.totalScore + (arrowsRemaining.value * convertToValue(gameTypeConfig[props.gameType].scores[0])));

const availableClassifications = computed(() => {
  return classificationCalculator.value?.(
    totals.value.totalScore,
    averageScoresPerEnd.value
  );
});
</script>

<template>
  <div class="detailsHint" v-if="!userDetailsSaved">
    <p>👋 Before shooting, please consider entering your details in the <em>You</em> tab at the top right.</p>
    <p>Fast will work better if you do 🥳, and will be able to help you better track your progress</p>
    <p>Don't forget to press the <em>save button</em></p>
  </div>
  <details class="dropdown" id="classification" v-if="availableClassifications && userDetailsSaved && hasStarted">
    <summary>Tap to view classification calculations</summary>
    <div>
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
                                               v-if="classification.shortBy"> (-{{ classification.shortBy }})</span>
          </td>
          <td>{{ classification.scorePerEnd }} <span class="avgOnTrack"
                                                     v-if="classification.perEndDiff>=0">(+{{ classification.perEndDiff
            }})</span><span
            class="avgOffTrack" v-if="classification.perEndDiff<0">({{ classification.perEndDiff }})</span></td>
        </tr>
        <tr>
          <td colspan="2">Arrows remaining</td>
          <td>{{ arrowsRemaining }}</td>
        </tr>
        <tr>
          <td colspan="2">Max possible score</td>
          <td>{{ maxPossibleScore }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>


<style scoped>
.detailsHint p {
  padding: 0.5em;
  font-size: 1.1em
}
.achieved, .avgOnTrack {
  color: green;
}

.short, .avgOffTrack {
  color: red;
}

.failed {
  text-decoration: line-through;
}

details + details {
  border-top: none;
}

details[open] {
  padding-bottom: 1em;
}

summary {
  padding: 1rem 1em 1rem 0.7rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
