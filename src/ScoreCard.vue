<script setup>
import { useScoresStore } from "@/stores/scores";
import ScoreButtons from "@/components/ScoreButtons.vue";
import GameTypeSelector from "@/components/GameTypeSelector.vue";
import { useGameTypeStore } from "@/stores/game_type";
import { computed, ref } from "vue";
import { convertToValues, X } from "@/domain/scores";
import RoundScores from "@/components/RoundScores.vue";
import { calculateTotal } from "@/domain/subtotals";
import { useToast } from "vue-toastification";
import { useHistoryStore } from "@/stores/history";

const synth = window.speechSynthesis;

const scoresStore = useScoresStore();
const gameTypeStore = useGameTypeStore();
const validScores = computed(() => gameTypeStore.currentRound.scores);
const maxReached = computed(() => scoresStore.scores.length >= gameTypeStore.currentRound.maxArrows);

//todo: this is copied from data management, DRY it up
const history = useHistoryStore();
const toast = useToast();
const date = ref(new Date().toISOString().substr(0, 10));
const runningTotal = computed(() => calculateTotal(convertToValues(scoresStore.scores, gameTypeStore.type)));

const insults = [
  "Dumb ass",
  "How long have you been shooting?",
  "Is your site mark set to stupid?",
  "Maybe you should just go home",
  "Throw your bow in the bin",
  "You're not even trying",
  "You are a danger to yourself and others",
  "Are your eyes open",
  "Your aim is as good as your jokes.",
  "Are you aiming for a different universe?",
  "You couldn't hit water if you fell out of a boat",
  "Is this some kind of abstract art?",
  "Nice shot! For someone who hates hitting the target",
  "You're redefining what it means to miss",
  "Are you allergic to accuracy?",
  "There's always next year",
  "Everyone hates finding your arrows but are being too polite about it",
  "We'd be speaking French if you were at the battle of Agincourt",
  "You are Tesco value robin hood",
  "Is your bow upside down?",
  "Maybe try the beginner's course again",
  "We cant kick you out of the club for being bad, but we'll find another reason",
  "Did you know you are supposed to hit the target?",
  "Maybe next time",
  "I shoot better and I am just a phone, with no ability to pick up a bow",
  "Did you trip over the line when you were at full draw?",
  "I've seen better shooting by a 2 week old baby.",
  "We've had to check with the farm how much it would cost to replace a sheep because of your shooting.",
  "It's very kind of you to save the target face from wear and tear.",
  "That was not very good.",
  "I hope you shoot better photos than you do arrows",
  "When you went to draw your bow, did you take out a crayon?",
  "Is your anchor at your arse?",
  "We all have off days.",
  "Did you find your anchor on a boat?",
  "Are the limbs the right way round?",
  "Is your bracing height a negative number?",
  "Have you replaced your button with the button from your shirt",
  "It might have been better to dry fire that one",
  "Here's a solution to target panic, stop panicking",
  "Peter André wrote Mysterious girl about you, because you keep missing",
  "If you do that again at the next end, it's you",
  "I thought the sheep had been in this field but it was just your arrow",
  "I have a joke for you. What's the difference between you and the sheep? Nothing, you both stink at archery",
  "Did you tune your bow with a banana?",
  "Your bow is so out of tune I thought it was a sheep coughing.",
  "You're not supposed to tune your bow to F",
  "I'm not sure the metal detectors can find your arrows, because you are shooting poops",
  "Archery GB are introducing archer 4 classification, just for you",
  "There are no badges for scoring 50 in 3 dozen arrows",
  "That was a good shot, for a longbow, at 200 yards, in the dark, during an earthquake",
  "Please don't offer advice to anyone, ever",
  "Your boss mate doesn't need to worry about their arrows getting damaged",
  "Nice gear; it's a shame you can't buy talent",
  "Changing your arrows wont make a difference, because you are very bad",
  "Don't bother upgrading your equipment, upgrade your brain",
  "The club members won’t laugh at you, but I will ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha ha",
  "Thank you for becoming a member of the spider conservation society",
  "What do you call an archer who never misses? Not you.",
  "Is your favourite musical artist Missy Elliott?",
  "Next time shoot your arrow and we'll paint the target around it",
  "Have you ever tried blind-folded archery? You don't know what you're missing",
  "Your favourite Mister men character is Mister miss"
];

function saveScores(event) {
  event.preventDefault();
  try {
    history.add(date.value, runningTotal, gameTypeStore.type, scoresStore.scores, gameTypeStore.currentRound.unit);
    toast.success("Scores saved");
  } catch (error) {
    console.log(error);
    toast.error("Error saving scores", error);
  }
}

function clearScores() {
  if (confirm("Are you sure you want to clear all data?")) {
    if (confirm("Yeah but really?")) {
      scoresStore.clear();
    }
  }
}

function addScore(score) {
  console.log(score);
  if (score === "M") {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(insults[Math.floor(Math.random() * insults.length)]);
    utterance.rate = 0.8;
    synth.speak(utterance);
  }
  scoresStore.add(score);
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


    <RoundScores :scores="scoresStore.scores"
               :game-type="gameTypeStore.type"
               :endSize="gameTypeStore.currentRound.endSize"
               :hasX="validScores.includes(X)" />
  </div>

  <div class="controls">
    <GameTypeSelector :gameType="gameTypeStore.type"
                      @changeGameType="gameTypeStore.setGameType" />
    <button @click="clearScores">Clear data</button>
  </div>
</template>

<style scoped>
.controls {
  width: 100vw;
  display: flex;
  justify-content: space-between;
}

.controls select {
  padding: 0.5em;
  font-size: 1.5em;
  flex: 1 1 0;
  max-width: 80vw;
}

.controls button {
  max-width: 20vh;
}
.page {
  width: 100vw;
}

.save {
  width: 100%;
  font-size: 1.5em;
  height: 15vh
}
</style>
