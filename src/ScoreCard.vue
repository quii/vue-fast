<script setup>
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import NoteModal from "@/components/modals/NoteModal.vue";
import ShootEditModal from "@/components/modals/ShootEditModal.vue";
import RoundScores from "@/components/RoundScores.vue";
import InteractiveTargetFace from "@/components/scoring/InteractiveTargetFace.vue";
import ScoreButtons from "@/components/scoring/ScoreButtons.vue";
import UserNotes from "@/components/UserNotes.vue";
import TopBar from "@/components/TopBar.vue";
import ScoreCardTutorial from '@/components/tutorial/ScoreCardTutorial.vue'
import { insults } from "@/domain/insults";
import { X } from "@/domain/scoring/game_type_config.js";
import { calculateMaxPossibleScore, convertToValues } from "@/domain/scoring/scores.js";
import { calculateTotal } from "@/domain/scoring/subtotals.js";
import { useArrowHistoryStore } from "@/stores/arrow_history.js";
import { useGameTypeStore } from "@/stores/game_type";
import { useHistoryStore } from "@/stores/history";
import { useScoresStore } from "@/stores/scores";
import { useShootTimingStore } from "@/stores/shoot-timing";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";
import { usePreferencesStore } from '@/stores/preferences'
import { useShootStore } from '@/stores/shoot'
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useToast } from "vue-toastification";
import {
  createClassificationCalculator, getHighestPossibleClassification
} from '@/domain/scoring/classification'
import { calculateSubtotals } from "@/domain/scoring/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/scoring/distance_totals";
import { useRoute, useRouter } from "vue-router";
import { DEFAULT_SHOOT_STATUS } from '@/domain/shoot/shoot_status.js'
import { useAchievementStore } from '@/stores/achievements.js';
import DistanceAnalysisCard from '@/components/DistanceAnalysisCard.vue';

const synth = window.speechSynthesis;
const router = useRouter();

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const arrowHistoryStore = useArrowHistoryStore();
const userStore = useUserStore();
const notesStore = useNotesStore();
const history = useHistoryStore();
const preferencesStore = usePreferencesStore()
const shootStore = useShootStore()
const shootTimingStore = useShootTimingStore()
const achievementStore = useAchievementStore()

const route = useRoute();
const showTutorial = ref(false)

onMounted(async () => {
  // Show tutorial if user hasn't seen it before
  if (!preferencesStore.hasSeenScoreCardTutorial) {
    showTutorial.value = true
  }


  // Only initialize WebSocket if we might be restoring a live shoot
  // Try to restore any persisted shoot state first
  const restored = await shootStore.tryRestoreFromPersistedState()
  
  // If we successfully restored a live shoot, WebSocket is already initialized
  // No need to initialize WebSocket for regular scoring
})

onUnmounted(() => {
  // Clean up WebSocket connection when leaving the score card
  shootStore.cleanup()
})

watch(() => route.query.selectedRound, (newRound) => {
  if (newRound) {
    gameTypeStore.setGameType(newRound);
    router.replace({ query: {} });
  }
}, { immediate: true });


const validScores = computed(() => gameTypeStore.currentRound.getScores(userStore.user.bowType))
const maxReached = computed(() => {
  const maxArrows = gameTypeStore.currentRound.maxArrows;
  return scoresStore.scores.length >= maxArrows && maxArrows !== Infinity;
});

const toast = useToast();
const noteText = ref("");
const date = ref(new Date().toISOString());
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)));
const hasStarted = computed(() => scoresStore.scores.length > 0);

const currentEnd = computed(() => Math.floor(scoresStore.scores.length / gameTypeStore.currentRound.endSize));

const showNoteTaker = ref(false);
const showSaveModal = ref(false);
const isSaving = ref(false);
// New ref for leaderboard modal

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

watch([() => runningTotal.value, () => scoresStore.scores.length], async ([newTotal, newArrowCount], [oldTotal, oldArrowCount]) => {
  if (shootStore.isInShoot && userStore.user.name && (newTotal !== oldTotal || newArrowCount !== oldArrowCount)) {
    if(newTotal===0 && oldTotal >0) {
      return;
    }

    const highestClassification = getHighestPossibleClassification(
      availableClassifications.value,
      maxPossibleScore.value
    );

    const classification = highestClassification ? highestClassification.name : null;

    await shootStore.updateScore(
      userStore.user.name,
      newTotal,
      gameTypeStore.type,
      scoresStore.scores.length,
      classification,
      scoresStore.scores
    )
  }
})

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

watch(() => maxReached.value, (isMaxReached) => {
  if (isMaxReached && !isSaving.value && !showSaveModal.value) {
    // Automatically show the save modal when the shoot is completed
    // Only if we're not already saving and the modal isn't already open
    showSaveModal.value = true
  }
}, { immediate: false })

function showSaveConfirmation() {
  // Prevent double-saves by checking if we're already saving
  if (isSaving.value) {
    return;
  }
  showSaveModal.value = true;
}



async function handleSaveFromModal(data) {
  // Prevent double-saves
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;
  
  // Update date and status from modal
  date.value = data.date;

  try {
    // If we're in a shoot, finish the shoot first
    if (shootStore.isInShoot && userStore.user.name) {
      await shootStore.finishShoot(
        userStore.user.name,
        runningTotal.value,
        gameTypeStore.type,
        scoresStore.scores.length,
        undefined,
        scoresStore.scores
      )
    }

    const shootDuration = shootTimingStore.getShootDuration();

    const id = await history.add(
      date.value,
      runningTotal.value,
      gameTypeStore.type,
      [...scoresStore.scores],
      gameTypeStore.currentRound.unit,
      userStore.user,
      data.shootStatus, // Use the status from the modal
      shootDuration // Pass the calculated duration
    );

    arrowHistoryStore.saveArrowsForShoot(id, [...scoresStore.arrows]);
    notesStore.assignPendingNotesToShoot(id);
    

    // Wait for Vue's reactive updates to be processed

    scoresStore.clear();
    shootTimingStore.clearTiming(); // Clear timing data for next shoot
    showSaveModal.value = false;

    // Navigate to the saved shoot with flag to check achievements
    router.push(`/history/${id}?checkAchievements=true`);
  } catch (error) {
    console.log(error);
    toast.error("Error saving scores", error);
  } finally {
    // Always reset saving state, even if there's an error
    isSaving.value = false;
  }
}


function cancelSave() {
  showSaveModal.value = false;
  isSaving.value = false; // Reset saving state when canceling
}

function clearScores() {
  scoresStore.clear();
  shootTimingStore.clearTiming(); // Reset timing when scores are cleared
}

function handleUndo() {
  scoresStore.undo();
  // If no scores left, clear timing
  if (scoresStore.scores.length === 0) {
    shootTimingStore.clearTiming();
  }
}

function handleScore(scoreData) {
  // Record timing for shoot duration calculation
  if (!shootTimingStore.hasStarted()) {
    shootTimingStore.recordFirstArrow();
  }
  shootTimingStore.recordLastArrow();

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

function closeTutorial() {
  showTutorial.value = false
}

</script>

<template>
  <div class="page">
    <div class="sticky-header">
      <div class="top-bar-container">
        <TopBar
          :hasStarted="hasStarted"
          :arrowsRemaining="arrowsRemaining"
          :maxPossibleScore="maxPossibleScore"
          :availableClassifications="availableClassifications"
          :canSave="canSave"
          :maxReached="maxReached"
          :isSaving="isSaving"
          @clear-scores="clearScores"
          @take-note="handleTakeNote"
          @save-scores="showSaveConfirmation"
        />
      </div>

      <div v-if="userStore.isExperimentalUser()" class="interactive-target-face">
        <InteractiveTargetFace
          :arrows="scoresStore.arrows"
          :scores="scoresStore.scores"
          :game-type="gameTypeStore.type"
          :valid-scores="validScores"
          :max-reached="maxReached"
          :knock-color="userStore.user.knockColor"
          @score="handleScore"
          @undo="handleUndo"
        />
      </div>
      <div v-else class="score-buttons">
        <ScoreButtons
          :validScores="validScores"
          @score="handleScore"
          :max-reached="maxReached"
          :scores="scoresStore.scores"
          :game-type="gameTypeStore.type"
          @undo="handleUndo"
        />
      </div>
    </div>

    <div class="scrollable-content">
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

      <div class="game-type-selector">
        <GameTypeSelector
          :gameType="gameTypeStore.type"
          @changeGameType="gameTypeStore.setGameType"
        />
      </div>
      
      <!-- Distance Performance Analysis Card -->
      <DistanceAnalysisCard :round-name="gameTypeStore.type" />
    </div>

    <!-- Tutorial Component -->
    <ScoreCardTutorial
      :visible="showTutorial"
      @close="closeTutorial"
    />
  </div>
</template>

<style scoped>
.has-notes {
  margin-top: 1rem;
}

.page {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); /* Adjust for bottom navigation */
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-background);
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
}

.interactive-target-face,
.game-type-selector {
  margin-bottom: 1rem;
}

.scrollable-content > :last-child {
  margin-bottom: 2rem;
}

</style>
