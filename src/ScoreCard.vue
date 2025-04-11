<script setup>
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import NoteModal from "@/components/modals/NoteModal.vue";
import RoundScores from "@/components/RoundScores.vue";
import InteractiveTargetFace from "@/components/scoring/InteractiveTargetFace.vue";
import ScoreButtons from "@/components/scoring/ScoreButtons.vue";
import UserNotes from "@/components/UserNotes.vue";
import TopBar from "@/components/TopBar.vue";
import HistoryCard from "@/components/HistoryCard.vue";
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
import { getAllShootStatuses, DEFAULT_SHOOT_STATUS } from "@/domain/shoot/shoot_status.js";

const synth = window.speechSynthesis;
const router = useRouter();

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const arrowHistoryStore = useArrowHistoryStore();
const userStore = useUserStore();
const notesStore = useNotesStore();
const history = useHistoryStore();
const selectedShootStatus = ref(DEFAULT_SHOOT_STATUS);
const shootStatuses = getAllShootStatuses();

const route = useRoute();

watch(() => route.query.selectedRound, (newRound) => {
  if (newRound) {
    gameTypeStore.setGameType(newRound);
    // Clear the query parameter after using it
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

const userProfile = computed(() => {
  return {
    gender: userStore.user.gender,
    ageGroup: userStore.user.ageGroup,
    bowType: userStore.user.bowType,
    classification: userStore.user.classification
  };
});

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
  userProfile.value.gender &&
  userProfile.value.ageGroup &&
  userProfile.value.bowType
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
    userProfile.value.gender,
    userProfile.value.ageGroup,
    userProfile.value.bowType,
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

function saveScores() {
  try {
    const id = history.add(date.value,
      runningTotal.value,
      gameTypeStore.type,
      [...scoresStore.scores],
      gameTypeStore.currentRound.unit,
      userProfile.value,
      selectedShootStatus.value
    );

    arrowHistoryStore.saveArrowsForShoot(id, [...scoresStore.arrows]);
    notesStore.assignPendingNotesToShoot(id);
    scoresStore.clear();
    showSaveModal.value = false;
    selectedShootStatus.value = DEFAULT_SHOOT_STATUS;
    toast.success("Scores saved, please find them in the history");

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
  toast.success("Note saved");
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
    <div v-if="showSaveModal" class="modal-overlay">
      <div class="modal-content save-modal">
        <h3>Save to History</h3>
        <p>Review your score before saving:</p>

        <div class="history-preview">
          <HistoryCard :item="historyPreview" />
        </div>

        <!-- Add shoot status selection -->
        <div class="shoot-status-selection">
          <h4>Shoot Type:</h4>
          <div class="radio-group">
            <div
              v-for="status in shootStatuses"
              :key="status"
              class="radio-option"
            >
              <input
                type="radio"
                :id="status"
                :value="status"
                v-model="selectedShootStatus"
                :name="'shoot-status'"
              >
              <label :for="status">{{ status === "RecordStatus" ? "Record Status" : status }}</label>
            </div>
          </div>
        </div>

        <div class="confirmation-actions">
          <button
            class="save-button"
            @click="saveScores">
            Save to History
          </button>
          <button
            class="cancel-button"
            @click="cancelSave">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <RoundScores v-if="hasStarted" :scores="scoresStore.scores"
                 :game-type="gameTypeStore.type"
                 :endSize="gameTypeStore.currentRound.endSize"
                 :hasX="validScores.includes(X)"
                 :user-profile="userProfile"
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90vw;
  max-width: 400px;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1.5em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.save-modal h3 {
  margin-top: 0;
  color: var(--color-highlight, #4CAF50);
  text-align: center;
}

.history-preview {
  margin: 1.5em 0;
}

.confirmation-actions {
  display: flex;
  gap: 1em;
  margin-top: 1.5em;
}

.save-button, .cancel-button {
  flex: 1;
  padding: 0.75em;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
}

.save-button:active {
  background-color: var(--color-highlight-bright, #5FDF63);
  transform: scale(0.98);
}

.cancel-button {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border, #ccc);
}

.cancel-button:active {
  background-color: var(--color-background-mute, #f5f5f5);
  transform: scale(0.98);
}

::backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}

button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.shoot-status-selection {
  margin: 1.5em 0;
  border-top: 1px solid var(--color-border, #eee);
  padding-top: 1em;
}

.shoot-status-selection h4 {
  margin-top: 0;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: var(--color-text);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.radio-option input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid var(--color-border, #ccc);
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
}

.radio-option input[type="radio"]:checked {
  border-color: var(--color-highlight, #4CAF50);
}

.radio-option input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.6em;
  height: 0.6em;
  background-color: var(--color-highlight, #4CAF50);
  border-radius: 50%;
}

.radio-option label {
  font-size: 1em;
  cursor: pointer;
}
</style>
