<script setup>
import { useUserStore } from "@/stores/user";
import { computed, ref, watch, watchEffect } from "vue";
import {
  calculatePotentialClassificationWithoutOutliers,
  createClassificationCalculator,
  getRelevantClassifications
} from "@/domain/scoring/classification";
import { calculateSubtotals } from "@/domain/scoring/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/scoring/distance_totals";
import { gameTypeConfig } from "@/domain/scoring/game_types";
import { calculateMaxPossibleScore } from "@/domain/scoring/scores";
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
  },
  userProfile: {
    type: Object,
    default: null
  }
});

const userStore = useUserStore();
const historyStore = useHistoryStore();
const personalBest = computed(() => historyStore.personalBest(props.gameType));

// Determine if we should use the provided profile or the current user profile
const effectiveUserProfile = computed(() => {
  return props.userProfile || {
    gender: userStore.user.gender,
    ageGroup: userStore.user.ageGroup,
    bowType: userStore.user.bowType,
    classification: userStore.user.classification
  };
});

const userDetailsSaved = computed(() =>
  effectiveUserProfile.value.gender &&
  effectiveUserProfile.value.ageGroup &&
  effectiveUserProfile.value.bowType
);

const isPracticeRound = computed(() => {
  return props.gameType.toLowerCase().includes("practice");
});

watch(() => userDetailsSaved.value, (x) => {
  console.log("user details saved", x);
});

const classificationCalculator = ref(null);

watchEffect(async () => {
  if (!userDetailsSaved.value || isPracticeRound.value) {
    classificationCalculator.value = null;
    return;
  }

  classificationCalculator.value = await createClassificationCalculator(
    props.gameType,
    effectiveUserProfile.value.gender,
    effectiveUserProfile.value.ageGroup,
    effectiveUserProfile.value.bowType,
    personalBest.value
  );
});

const showTableByDefault = computed(() => arrowsRemaining.value === 0);

const totals = computed(() => calculateSubtotals(props.scores, props.gameType));
const averageScoresPerEnd = computed(() => calculateAverageScorePerEnd(props.scores, props.endSize, props.gameType));
const arrowsRemaining = computed(() => gameTypeConfig[props.gameType].maxArrows - props.scores.length);
const maxPossibleScore = computed(() => calculateMaxPossibleScore(totals.value.totalScore, arrowsRemaining.value, props.gameType));

const availableClassifications = computed(() => {
  if (!classificationCalculator.value) return null;

  return classificationCalculator.value(
    totals.value.totalScore,
    averageScoresPerEnd.value
  );
});

const closeToNextClassification = computed(() => {
  // if we're at the end
  if (arrowsRemaining.value > 0 || isPracticeRound.value) {
    return false;
  }

  return calculatePotentialClassificationWithoutOutliers(
    props.scores,
    effectiveUserProfile.value.classification,
    props.gameType,
    effectiveUserProfile.value.gender,
    effectiveUserProfile.value.ageGroup,
    effectiveUserProfile.value.bowType);
});

</script>

<template>
  <div v-if="!isPracticeRound">
    <div class="detailsHint" v-if="!userDetailsSaved">
      <p>👋 Before shooting, please consider entering your details in the <em>You</em> tab at the top right.</p>
      <p>Fast will work better if you do 🥳, and will be able to help you better track your progress</p>
      <p>Don't forget to press the <em>save button</em></p>
    </div>
    <details class="dropdown" id="classification"
             v-if="userDetailsSaved && !showTableByDefault">
      <summary>Tap to view classification calculations</summary>
      <div>
        <ClassificationDetailsTable :max-possible-score=maxPossibleScore
                                    :arrows-remaining=arrowsRemaining
                                    :available-classifications=availableClassifications />
      </div>
    </details>

    <div v-if="showTableByDefault" id="classification">
      <ClassificationDetailsTable :max-possible-score=maxPossibleScore
                                  :arrows-remaining=arrowsRemaining
                                  :available-classifications=getRelevantClassifications(availableClassifications) />
    </div>

    <div class="hint" v-if="closeToNextClassification && closeToNextClassification.achievable">
      <h3>Better luck next time!</h3>
      <p>If you tidied up {{ closeToNextClassification.arrowsToImprove }} of your worst shots, you could've achieved a
        {{ closeToNextClassification.classification }}</p>
    </div>
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
