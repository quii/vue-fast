<script setup>
import { useScoresStore } from "@/stores/scores";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { useGameTypeStore } from "@/stores/game_type";
import { computed, ref } from "vue";
import { convertToValues } from "@/domain/scores";
import RoundScores from "@/components/RoundScores.vue";
import { calculateTotal } from "@/domain/subtotals";
import { useToast } from "vue-toastification";
import { useHistoryStore } from "@/stores/history";
import { insults } from "@/domain/insults";
import { X } from "@/domain/game_type_config";
import { useUserStore } from "@/stores/user";
import { useNotesStore } from "@/stores/user_notes";
import UserNotes from "@/components/UserNotes.vue";

const synth = window.speechSynthesis;

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const validScores = computed(() => gameTypeStore.currentRound.scores);
const maxReached = computed(() => scoresStore.scores.length >= gameTypeStore.currentRound.maxArrows);
const userStore = useUserStore();
const notesStore = useNotesStore();

//todo: this is copied from data management, DRY it up
const history = useHistoryStore();
const toast = useToast();
const noteText = ref("");
const date = ref(new Date().toISOString().substr(0, 10));
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)));
const hasStarted = computed(() => scoresStore.scores.length > 0);

function saveScores(event) {
  event.preventDefault();
  try {
    const id = history.add(date.value, runningTotal.value, gameTypeStore.type, [...scoresStore.scores], gameTypeStore.currentRound.unit);
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

function addScore(score) {
  if (score === "M" && userStore.user.constructiveCriticism) {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(insults[Math.floor(Math.random() * insults.length)]);
    utterance.rate = 0.8;
    synth.speak(utterance);
  }
  scoresStore.add(score);
}

function saveNote() {
  const completedEnds = Math.floor(scoresStore.scores.length / gameTypeStore.currentRound.endSize);
  const currentEnd = completedEnds > 0 ? completedEnds : 1;
  notesStore.addPendingNote(currentEnd, noteText.value);
  noteText.value = "";
  document.getElementById("noteTaker").hidePopover();
  toast.success("Note saved");
}

</script>

<template>
  <div class="page">
    <ScoreButtons :validScores="validScores"
                  @score="addScore"
                  :max-reached="maxReached"
                  :scores="scoresStore.scores"
                  :game-type="gameTypeStore.type"
                  @undo="scoresStore.undo" />

    <button class="save" v-if="maxReached" @click="saveScores">💾 Save score to history</button>

    <div id="noteTaker" popover>
      <textarea v-model="noteText" id="noteTakerTextArea" placeholder="Take note of anything here.

Did the end go well?

Why or why not?

Did you follow your process?"></textarea>
      <button @click="saveNote" :disabled="!noteText.trim()">💾 Save note</button>
    </div>

    <RoundScores v-if="hasStarted" :scores="scoresStore.scores"
                 :game-type="gameTypeStore.type"
                 :endSize="gameTypeStore.currentRound.endSize"
                 :hasX="validScores.includes(X)" />
  </div>
  <hr />
  <button class="Take note" popovertarget="noteTaker">📝 Take a note</button>
  <UserNotes />

  <hr />
  <p class="selectHint">Select the round you're shooting 👇</p>
  <div class="controls">
    <GameTypeSelector :gameType="gameTypeStore.type"
                      @changeGameType="gameTypeStore.setGameType" />
  </div>

  <hr />
  <div v-if="hasStarted">
    <p class="selectHint">Danger zone</p>
    <button id="clear" @click="clearScores">⚠️ Clear all scores for this shoot ⚠️</button>
  </div>

</template>

<style scoped>
.selectHint {
  padding: 0.5em;
  font-size: 1.1em;
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

#noteTaker {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  height: 70vh;
}

#noteTaker textarea {
  width: 100%;
  height: 90%;
  resize: none;
  font-size: 1.5em;
  padding: 1em;
  border: none;
}

#noteTaker button {
  width: 100%;
  font-size: 1.5em;
  height: 10%;
}

button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
