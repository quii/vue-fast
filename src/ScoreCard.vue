<script setup>
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import NoteModal from "@/components/modals/NoteModal.vue";
import ShootEditModal from "@/components/modals/ShootEditModal.vue";
import RoundScores from "@/components/RoundScores.vue";
import InteractiveTargetFace from "@/components/scoring/InteractiveTargetFace.vue";
import ScoreButtons from "@/components/scoring/ScoreButtons.vue";
import UserNotes from "@/components/UserNotes.vue";
import TopBar from "@/components/TopBar.vue";
import { insults } from "@/domain/insults";
import { X } from "@/domain/scoring/game_type_config.js";
import { calculateMaxPossibleScore, convertToValues } from "@/domain/scoring/scores.js";
import { calculateTotal } from "@/domain/scoring/subtotals.js";
import { useArrowHistoryStore } from "@/stores/arrow_history.js";
import { useGameTypeStore } from "@/stores/game_type";
import { useHistoryStore } from "@/stores/history";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import { watch } from "vue";
import {
  createClassificationCalculator
} from "@/domain/scoring/classification";
import { calculateSubtotals } from "@/domain/scoring/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/scoring/distance_totals";
import { useRoute, useRouter } from "vue-router";
import { DEFAULT_SHOOT_STATUS } from '@/domain/shoot/shoot_status.js'

const synth = window.speechSynthesis;
const router = useRouter();

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const arrowHistoryStore = useArrowHistoryStore();
const userStore = useUserStore();
const notesStore = useNotesStore();
const history = useHistoryStore();

const route = useRoute();

watch(() => route.query.selectedRound, (newRound) => {
  if (newRound) {
    gameTypeStore.setGameType(newRound);
    router.replace({ query: {} });
  }
}, { immediate: true });

const validScores = computed(() => gameTypeStore.currentRound.scores);
const maxReached = computed(() => {
  const maxArrows = gameTypeStore.currentRound.maxArrows;
  return scoresStore.scores.length >= maxArrows && maxArrows !== Infinity;
});

const toast = useToast();
const noteText = ref("");
const date = ref(new Date().toISOString().substr(0, 10));
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)));
const hasStarted = computed(() => scoresStore.scores.length > 0);

const currentEnd = computed(() => Math.floor(scoresStore.scores.length / gameTypeStore.currentRound.endSize));

const showNoteTaker = ref(false);
const showSaveModal = ref(false); // New ref for save modal

const classificationCalculator = ref(null);
const availableClassifications = ref(null);
const totals = computed(() => calculateSubtotals(scoresStore.scores, gameTypeStore.type));
const averageScoresPerEnd = computed(() =>
  calculateAverageScorePerEnd(scoresStore.scores, gameTypeStore.currentRound.endSize, gameTypeStore.type)
);

const canSaveAnytime = computed(() =>
  gameTypeStore.currentRound.canSaveAnytime && scoresStore.scores.length > 0
);
const canSave = computed(() => maxReached.value || canSaveAnytime.value);

const arrowsRemaining = computed(() => {
  const maxArrows = gameTypeStore.currentRound.maxArrows;
  return maxArrows === Infinity ? null : maxArrows - scoresStore.scores.length;
});

const maxPossibleScore = computed(() => {
  if (arrowsRemaining.value === null) return null;
  return calculateMaxPossibleScore(totals.value.totalScore, arrowsRemaining.value, gameTypeStore.type);
});

const userDetailsSaved = computed(() =>
  userStore.user.gender &&
  userStore.user.ageGroup &&
  userStore.user.bowType
);

const isPracticeRound = computed(() => {
  return gameTypeStore.type.toLowerCase().includes("practice");
});

const personalBest = computed(() => history.personalBest(gameTypeStore.type));

const historyPreview = computed(() => {
  // Calculate average per end if possible
  let averagePerEnd = null;
  if (scoresStore.scores.length > 0 && gameTypeStore.currentRound.endSize > 0) {
    const totalScore = runningTotal.value;
    const totalEnds = Math.ceil(scoresStore.scores.length / gameTypeStore.currentRound.endSize);
    averagePerEnd = (totalScore / totalEnds).toFixed(1);
  }

  const isTopScore = personalBest.value < runningTotal.value;

  let classification = null;
  if (availableClassifications.value && availableClassifications.value.length > 0) {
    // Filter to only include achieved classifications and exclude "PB"
    const validClassifications = availableClassifications.value.filter(c =>
      c.achieved && c.name !== "PB"
    );

    if (validClassifications.length > 0) {
      // Get the last item (highest valid classification)
      const highestClassification = validClassifications[validClassifications.length - 1];
      classification = {
        name: highestClassification.name,
        scheme: highestClassification.scheme
      };
    }
  }

  return {
    date: date.value,
    gameType: gameTypeStore.type,
    score: runningTotal.value,
    averagePerEnd: averagePerEnd,
    topScore: isTopScore,
    classification: classification
  };
});

watch([() => gameTypeStore.type, userDetailsSaved, isPracticeRound], async () => {
  if (!userDetailsSaved.value || isPracticeRound.value) {
    classificationCalculator.value = null;
    availableClassifications.value = null;
    return;
  }

  classificationCalculator.value = await createClassificationCalculator(
    gameTypeStore.type,
    userStore.user.gender,
    userStore.user.ageGroup,
    userStore.user.bowType,
    personalBest.value
  );
}, { immediate: true });

watch([() => scoresStore.scores, classificationCalculator, totals, averageScoresPerEnd], () => {
  if (!classificationCalculator.value) {
    availableClassifications.value = null;
    return;
  }

  availableClassifications.value = classificationCalculator.value(
    totals.value.totalScore,
    averageScoresPerEnd.value
  );
}, { immediate: true });

function showSaveConfirmation() {
  showSaveModal.value = true;
}

async function handleSaveFromModal(data) {
  // Update date and status from modal
  date.value = data.date;

  try {
    const id = await history.add(
      date.value,
      runningTotal.value,
      gameTypeStore.type,
      [...scoresStore.scores],
      gameTypeStore.currentRound.unit,
      userStore.user,
      data.shootStatus // Use the status from the modal
    );

    arrowHistoryStore.saveArrowsForShoot(id, [...scoresStore.arrows]);
    notesStore.assignPendingNotesToShoot(id);
    scoresStore.clear();
    showSaveModal.value = false;
  } catch (error) {
    console.log(error);
    toast.error("Error saving scores", error);
  }
}

function cancelSave() {
  showSaveModal.value = false;
}

function clearScores() {
  scoresStore.clear();
}

function handleScore(scoreData) {
  if (scoreData.position) {
    scoresStore.addArrow({
      id: Date.now(),
      position: scoreData.position,
      end: currentEnd.value
    });
  }

  if (scoreData.score === "M" && userStore.user.constructiveCriticism) {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(insults[Math.floor(Math.random() * insults.length)]);
    utterance.rate = 0.8;
    synth.speak(utterance);
  }
  scoresStore.add(scoreData.score);
}

function saveNote(text) {
  const completedEnds = Math.floor(scoresStore.scores.length / gameTypeStore.currentRound.endSize);
  const currentEnd = completedEnds > 0 ? completedEnds : 1;
  notesStore.addPendingNote(currentEnd, text);
  noteText.value = "";
  showNoteTaker.value = false;
}

function handleTakeNote() {
  showNoteTaker.value = true;
}

</script>

<template>
  <div class="page">
    <TopBar
      :hasStarted="hasStarted"
      :arrowsRemaining="arrowsRemaining"
      :maxPossibleScore="maxPossibleScore"
      :availableClassifications="availableClassifications"
      :canSave="canSave"
      :maxReached="maxReached"
      @clear-scores="clearScores"
      @take-note="handleTakeNote"
      @save-scores="showSaveConfirmation"
    />

    <InteractiveTargetFace
      v-if="userStore.isExperimentalUser()"
      :arrows="scoresStore.arrows"
      :scores="scoresStore.scores"
      :game-type="gameTypeStore.type"
      :valid-scores="validScores"
      :max-reached="maxReached"
      :knock-color="userStore.user.knockColor"
      @score="handleScore"
      @undo="scoresStore.undo"
    />
    <ScoreButtons
      v-else
      :validScores="validScores"
      @score="handleScore"
      :max-reached="maxReached"
      :scores="scoresStore.scores"
      :game-type="gameTypeStore.type"
      @undo="scoresStore.undo"
    />

    <NoteModal
      v-if="showNoteTaker"
      :initial-text="noteText"
      @save="saveNote"
      @close="showNoteTaker = false"
    />

    <!-- Save Confirmation Modal -->
    <ShootEditModal
      :visible="showSaveModal"
      :shootData="historyPreview"
      :isEditMode="false"
      :initialDate="date"
      :initialStatus="DEFAULT_SHOOT_STATUS"
      @save="handleSaveFromModal"
      @cancel="cancelSave"
    />

    <RoundScores v-if="hasStarted" :scores="scoresStore.scores"
                 :game-type="gameTypeStore.type"
                 :endSize="gameTypeStore.currentRound.endSize"
                 :hasX="validScores.includes(X)"
                 :user-profile="userStore.user"
    />
    <UserNotes :allow-highlight="true" />

    <GameTypeSelector :gameType="gameTypeStore.type"
                      @changeGameType="gameTypeStore.setGameType" />
  </div>

</template>

<style scoped>
.page {
  padding: 0.5rem;
}


</style>
