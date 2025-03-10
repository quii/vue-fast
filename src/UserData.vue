<script setup>
import { computed, ref, watchEffect } from "vue";
import { useUserStore } from "@/stores/user";
import RoundDetails from "@/components/RoundDetails.vue";
import { classificationList } from "@/domain/scoring/classificationList.js";
import { calculateAppropriateRounds } from "@/domain/scoring/game_types.js";

const userStore = useUserStore();

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);
const name = ref(userStore.user.name) || "";
const selectedClassification = ref(userStore.user.classification || classificationList[0]);
const maxYards = ref(userStore.user.maxYards ?? 100);
const constructiveCriticism = ref(userStore.user.constructiveCriticism ?? true);
const experimentalTargetFace = ref(userStore.user.experimentalTargetFace ?? false);
const knockColor = ref(userStore.user.knockColor ?? "#FF69B4"); // Hot pink default

const allArcherDetailsProvided = computed(() =>
  selectedClassification.value &&
  selectedAgeGroup.value &&
  selectedGender.value &&
  selectedBowtype.value
);

const suitableRounds = ref({ short: [], medium: [], long: [] });

watchEffect(async () => {
  if (allArcherDetailsProvided.value) {
    suitableRounds.value = await calculateAppropriateRounds(
      selectedClassification.value,
      selectedAgeGroup.value,
      selectedGender.value,
      selectedBowtype.value,
      maxYards.value
    );
  }
});

const hasSuitableRounds = computed(() => {
  return suitableRounds.value.short.length > 0 || suitableRounds.value.long.length > 0 || suitableRounds.value.medium.length > 0;
});

watchEffect(() => {
  userStore.save(
    selectedAgeGroup,
    selectedGender,
    selectedBowtype,
    selectedClassification,
    maxYards,
    name,
    constructiveCriticism,
    experimentalTargetFace,
    knockColor
  );
});
</script>
<template>
  <div>
    <h1>Your details</h1>
    <p>These details are used by the app to tell you your progress on classifications while you're shooting.</p>
    <p>This app is not an official record! You will have to report your scores to your records officer in the usual way.</p>

    <label>Name <input type="text" v-model="name" /></label>

    <select v-model="selectedAgeGroup">
      <option disabled value="">Select age group</option>
      <option>50+</option>
      <option value="senior">Senior</option>
      <option value="u21">Under 21</option>
      <option value="u18">Under 18</option>
      <option value="u16">Under 16</option>
      <option value="u15">Under 15</option>
      <option value="u14">Under 14</option>
      <option value="u12">Under 12</option>
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

    <label class="inline"><input type="checkbox" v-model="constructiveCriticism" /> Constructive criticism
      enabled</label>

    <label class="inline">
      <input type="checkbox" v-model="experimentalTargetFace" />
      Experimental target face scoring enabled
    </label>
    <label>Choose knock colour<input type="color" v-model="knockColor" />
    </label>
  </div>

  <div v-if="hasSuitableRounds" class="recommended-rounds">
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

.inline {
  display: inline-block;
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
