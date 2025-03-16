<script setup>
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import RoundScores from "@/components/RoundScores.vue";
import InteractiveTargetFace from "@/components/scoring/InteractiveTargetFace.vue";
import ScoreButtons from "@/components/scoring/ScoreButtons.vue";
import UserNotes from "@/components/UserNotes.vue";
import { insults } from "@/domain/insults";
import { X } from "@/domain/scoring/game_type_config.js";
import { convertToValues } from "@/domain/scoring/scores.js";
import { calculateTotal } from "@/domain/scoring/subtotals.js";
import { useArrowHistoryStore } from "@/stores/arrow_history.js";
import { useGameTypeStore } from "@/stores/game_type";
import { useHistoryStore } from "@/stores/history";
import { useScoresStore } from "@/stores/scores";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import CurrentSightMark from "./components/sight_marks/CurrentSightMark.vue";
import { watch } from "vue";

const synth = window.speechSynthesis;

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const arrowHistoryStore = useArrowHistoryStore();
const userStore = useUserStore();
const notesStore = useNotesStore();
const history = useHistoryStore();

const validScores = computed(() => gameTypeStore.currentRound.scores);
const maxReached = computed(() => {
  const maxArrows = gameTypeStore.currentRound.maxArrows;
  // If maxArrows is Infinity, this will never be true
  return scoresStore.scores.length >= maxArrows && maxArrows !== Infinity;
});

const toast = useToast();
const noteText = ref("");
const date = ref(new Date().toISOString().substr(0, 10));
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)));
const hasStarted = computed(() => scoresStore.scores.length > 0);

const currentEnd = computed(() => Math.floor(scoresStore.scores.length / gameTypeStore.currentRound.endSize));

const showNoteTaker = ref(false);

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

watch(maxReached, (isMaxReached) => {
  if (isMaxReached) {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Optional: Show a toast notification to make it even clearer
    toast.info("You've completed the shoot! You can now save your scores.");
  }
});

function saveScores(event) {
  event.preventDefault();

  try {
    const id = history.add(date.value,
      runningTotal.value,
      gameTypeStore.type,
      [...scoresStore.scores],
      gameTypeStore.currentRound.unit,
      userProfile.value
    );

    arrowHistoryStore.saveArrowsForShoot(id, [...scoresStore.arrows]);
    notesStore.assignPendingNotesToShoot(id);
    scoresStore.clear();
    toast.success("Scores saved, please find them in the history");

  } catch (error) {
    console.log(error);
    toast.error("Error saving scores", error);
  }
}

function clearScores() {
  if (confirm("Are you sure you want to clear all the scores for this shoot?")) {
    if (confirm("Yeah but really?")) {
      scoresStore.clear();
    }
  }
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

function saveNote() {
  const completedEnds = Math.floor(scoresStore.scores.length / gameTypeStore.currentRound.endSize);
  const currentEnd = completedEnds > 0 ? completedEnds : 1;
  notesStore.addPendingNote(currentEnd, noteText.value);
  noteText.value = "";
  showNoteTaker.value = false;
  toast.success("Note saved");
}

</script>

<template>
  <div class="page">
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
    <button
      class="save"
      v-if="maxReached || canSaveAnytime"
      @click="saveScores"
      :class="{ 'pulse-animation': maxReached }">
      💾 Save score to history
    </button>

    <button class="Take note" @click="showNoteTaker = true">📝 Take a note</button>

    <div id="noteTaker" v-if="showNoteTaker" class="modal-overlay">
      <div class="modal-content">
        <textarea v-model="noteText" id="noteTakerTextArea" placeholder="Take note of anything here.

Did the end go well?

Why or why not?

Did you follow your process?"></textarea>
        <div class="note-actions">
          <button @click="saveNote" :disabled="!noteText.trim()">💾 Save note</button>
          <button @click="showNoteTaker = false">❌ Cancel</button>
        </div>
      </div>
    </div>
    <RoundScores v-if="hasStarted" :scores="scoresStore.scores"
                 :game-type="gameTypeStore.type"
                 :endSize="gameTypeStore.currentRound.endSize"
                 :hasX="validScores.includes(X)"
                 :user-profile="userProfile"
    />
  </div>
  <hr />
  <UserNotes :allow-highlight="true" />

  <hr />
  <div class="controls">
    <GameTypeSelector :gameType="gameTypeStore.type"
                      @changeGameType="gameTypeStore.setGameType" />
  </div>
  <CurrentSightMark />

  <hr />
  <div v-if="hasStarted">
    <button id="clear" @click="clearScores">⚠️ Clear all scores for this shoot ⚠️</button>
  </div>

</template>

<style scoped>

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    background-color: var(--color-highlight, #4CAF50);
  }
  100% {
    transform: scale(1);
  }
}

.controls select {
  padding: 0.5em;
  font-size: 1.2em;
  width: 100vw;
  height: 5vh;
  color: var(--color-text);
  border: 1px solid var(--color-background-mute);
  border-radius: 0;
}

button {
  font-size: 1.2em;
  width: 100vw;

  height: 5vh;
  color: var(--color-text);
  border: 1px solid var(--color-background-mute);
}

.page {
  width: 100vw;
}

.save {
  width: 100%;
  font-size: 1.5em;
  height: 15vh
}

::backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}

/* Add these styles to replace the popover styling */
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
  height: 70vh;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.modal-content textarea {
  width: 100%;
  height: 90%;
  resize: none;
  font-size: 1.5em;
  padding: 1em;
  border: none;
}

.note-actions {
  display: flex;
  height: 10%;
}

.note-actions button {
  width: 50%;
  font-size: 1.5em;
}
button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
