<script setup>
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import { useUserStore } from "@/stores/user";
import { classificationList } from "@/domain/classification";
import { calculateAppropriateRounds } from "@/domain/game_types";
import RoundDetails from "@/components/RoundDetails.vue";

const userStore = useUserStore();

const toast = useToast();

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);
const selectedClassification = ref(userStore.user.classification) || classificationList[0];
const maxYards = ref(userStore.user.maxYards) || 100;

const suitableRounds = computed(() => {
  if (selectedClassification.value) {
    const rounds = calculateAppropriateRounds(selectedClassification.value,
      selectedAgeGroup.value,
      selectedGender.value,
      selectedBowtype.value,
      maxYards.value
    );
    return rounds;
  }
  return undefined;
});

const hasSuitableRounds = computed(() => {
  return suitableRounds.value.short.length > 0 && suitableRounds.value.long.length > 0 && suitableRounds.value.medium.length > 0;
});

function saveUserDetails(event) {
  event.preventDefault();
  userStore.save(selectedAgeGroup, selectedGender, selectedBowtype, selectedClassification, maxYards);
  toast.success("Details saved");
}
</script>
<template>
  <div>
    <h1>Your details</h1>
    <p>These details are used by the app to tell you your progress on classifications while you're shooting.</p>
    <p>This app is not an official record! You will have to report your scores to your records officer in the usual way.</p>

    <select v-model="selectedAgeGroup">
      <option disabled value="">Select age group</option>
      <option>50+</option>
      <option value="senior">Senior</option>
      <option value="u14">U14</option>
    </select>

    <select v-model="selectedGender">
      <option disabled value="">Select gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>

    <select v-model="selectedBowtype">
      <option disabled value="">Select bow type</option>
      <option value="recurve">Recurve</option>
      <option value="barebow">Barebow</option>
      <option value="longbow">Longbow</option>
      <option value="compound">Compound</option>
    </select>

    <select v-model="selectedClassification">
      <option>Unclassified</option>
      <option v-for="option in classificationList" :value="option" v-bind:key="option">
        {{ option }}
      </option>
    </select>

    <label>Max shooting distance ({{ maxYards }} yards)</label>
    <input type="range" v-model="maxYards" min="10" max="100" step="10" />

    <button type="submit" @click="saveUserDetails">💾 Save</button>
  </div>

  <div v-if="hasSuitableRounds">
    <h1>Suggested outdoor rounds</h1>
    <div class="sub" v-if="suitableRounds.short">
      <h2>Short shoot(s)</h2>
      <RoundDetails :rounds="suitableRounds.short"></RoundDetails>
    </div>
    <div class="sub" v-if="suitableRounds.medium">
      <h2>Medium shoot(s)</h2>
      <RoundDetails :rounds="suitableRounds.medium"></RoundDetails>
    </div>
    <div class="sub" v-if="suitableRounds.long">
      <h2>Long shoot(s)</h2>
      <RoundDetails :rounds="suitableRounds.long"></RoundDetails>
    </div>
  </div>

  <div v-if="!hasSuitableRounds">
    ⚠️ For your classification, your max distance is too short for me to suggest rounds to improve at.
  </div>

  <hr />

  <div class="buymeacoffee">
    <p>Happy for you to use this for free, but if you wish to show appreciation, <a href="https://buymeacoffee.com/quii">feel free to tap here and buy me a coffee ☕️ 🥰</a></p>
  </div>

</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
}

div.sub {
  padding: 0;
}

input {
  font-size: 1.5em;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

button {
  font-size: 1.5em;
  padding: 0.5em;
}
</style>
