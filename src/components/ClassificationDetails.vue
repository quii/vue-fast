<script setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import {
  calculatePotentialClassificationWithoutOutliers,
  createClassificationCalculator,
  getRelevantClassifications
} from "@/domain/classification";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/rounds";
import { gameTypeConfig } from "@/domain/game_types";
import { calculateMaxPossibleScore } from "@/domain/scores";
import { useHistoryStore } from "@/stores/history";
import ClassificationDetailsTable from "@/components/ClassificationDetailsTable.vue";

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

const showTableByDefault = computed(() => arrowsRemaining.value === 0);

const userDetailsSaved = computed(() => userStore.user.gender && userStore.user.ageGroup && userStore.user.bowType);
const hasStarted = computed(() => props.scores.length > 0);

const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const averageScoresPerEnd = computed(() => calculateAverageScorePerEnd(props.scores, props.endSize, props.gameType));
const arrowsRemaining = computed(() => gameTypeConfig[props.gameType].maxArrows - props.scores.length);
const maxPossibleScore = computed(() => calculateMaxPossibleScore(totals.value.totalScore, arrowsRemaining.value, props.gameType));

const availableClassifications = computed(() => {
  return classificationCalculator.value?.(
    totals.value.totalScore,
    averageScoresPerEnd.value
  );
});

const closeToNextClassification = computed(() => {
  // if we're at the end
  if (arrowsRemaining.value > 0) {
    return false;
  }

  return calculatePotentialClassificationWithoutOutliers(props.scores,
    userStore.user.classification,
    props.gameType,
    userStore.user.gender,
    userStore.user.ageGroup,
    userStore.user.bowType);
});

</script>

<template>
  <div class="detailsHint" v-if="!userDetailsSaved">
    <p>👋 Before shooting, please consider entering your details in the <em>You</em> tab at the top right.</p>
    <p>Fast will work better if you do 🥳, and will be able to help you better track your progress</p>
    <p>Don't forget to press the <em>save button</em></p>
  </div>

  <details class="dropdown" id="classification"
           v-if="availableClassifications && userDetailsSaved && hasStarted && !showTableByDefault">
    <summary>Tap to view classification calculations</summary>
    <div>
      <ClassificationDetailsTable :max-possible-score=maxPossibleScore
                                  :arrows-remaining=arrowsRemaining
                                  :available-classifications=availableClassifications />
    </div>
  </details>

  <div v-if="showTableByDefault">
    <ClassificationDetailsTable :max-possible-score=maxPossibleScore
                                :arrows-remaining=arrowsRemaining
                                :available-classifications=getRelevantClassifications(availableClassifications) />
  </div>

  <div class="hint" v-if="closeToNextClassification && closeToNextClassification.achievable">
    <h3>Better luck next time!</h3>
    <p>If you tidied up {{ closeToNextClassification.arrowsToImprove }} of your worst shots, you could've achieved a
      {{ closeToNextClassification.classification }}</p>
  </div>
</template>


<style scoped>
.detailsHint p {
  padding: 0.5em;
  font-size: 1.1em
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

.hint {
  padding: 1em;
}
</style>
