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
const isDetailsOpen = ref(false);

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
    <div class="details-hint" v-if="!userDetailsSaved">
      <p>👋 Before shooting, please consider entering your details in the <em>You</em> tab at the top right.</p>
      <p>Fast will work better if you do 🥳, and will be able to help you better track your progress</p>
      <p>Don't forget to press the <em>save button</em></p>
    </div>

    <div v-if="userDetailsSaved && !showTableByDefault" class="classification-collapsible">
      <div class="collapsible-header" @click="isDetailsOpen = !isDetailsOpen">
        <div class="header-info">
          <h3>Classification Details</h3>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">Arrows remaining:</span>
              <span class="stat-value">{{ arrowsRemaining }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Max possible:</span>
              <span class="stat-value">{{ maxPossibleScore }}</span>
            </div>
          </div>
        </div>
        <div class="toggle-icon">
          {{ isDetailsOpen ? "▲" : "▼" }}
        </div>
      </div>

      <div v-if="isDetailsOpen" class="collapsible-content">
        <ClassificationDetailsTable
          :max-possible-score="maxPossibleScore"
          :arrows-remaining="arrowsRemaining"
          :available-classifications="availableClassifications"
        />
      </div>
    </div>

    <div v-if="showTableByDefault" id="classification">
      <ClassificationDetailsTable
        :max-possible-score="maxPossibleScore"
        :arrows-remaining="arrowsRemaining"
        :available-classifications="getRelevantClassifications(availableClassifications)"
      />
    </div>

    <div class="hint" v-if="closeToNextClassification && closeToNextClassification.achievable">
      <h3>Better luck next time!</h3>
      <p>If you tidied up {{ closeToNextClassification.arrowsToImprove }} of your worst shots, you could've achieved a
        {{ closeToNextClassification.classification }}</p>
    </div>
  </div>
</template>

<style scoped>
.details-hint p {
  padding: 0.5em;
  font-size: 1.1em;
}

.classification-collapsible {
  margin: 1em 0.5em 0 0.5em;
  padding-bottom: 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-background-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 0;
}

.collapsible-header:hover {
  background-color: rgba(var(--color-background-mute-rgb), 0.5);
}

.header-info {
  flex-grow: 1;
}

.header-info h3 {
  margin: 0 0 0.5em 0;
  font-size: 1.2em;
  font-weight: 600;
}

.header-stats {
  display: flex;
  gap: 1.5em;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.stat-label {
  font-size: 0.9em;
  color: var(--color-text-light);
}

.stat-value {
  font-weight: 600;
}

.toggle-icon {
  font-size: 1em;
  color: var(--color-text-light);
}

.hint {
  margin-top: 1em;
  padding: 1em;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.hint h3 {
  margin-top: 0;
  font-size: 1.2em;
}
</style>
