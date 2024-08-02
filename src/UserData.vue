<script setup>
import { computed, ref } from "vue";
import { useToast } from "vue-toastification";
import { useUserStore } from "@/stores/user";
import { classificationList } from "@/domain/classification";
import { calculateAppropriateRounds } from "@/domain/game_types";

const userStore = useUserStore();

const toast = useToast();

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);
const selectedClassification = ref(userStore.user.classification);

const suitableRounds = computed(() => {
  if (selectedClassification.value) {
    const rounds = calculateAppropriateRounds(selectedClassification.value,
      selectedAgeGroup.value,
      selectedGender.value,
      selectedBowtype.value);
    console.log(rounds);
    return rounds;
  }
  return undefined;
});

function saveUserDetails(event) {
  event.preventDefault();
  userStore.save(selectedAgeGroup, selectedGender, selectedBowtype, selectedClassification);
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
      <option v-for="option in classificationList" :value="option" v-bind:key="option">
        {{ option }}
      </option>
    </select>
    <button type="submit" @click="saveUserDetails">💾 Save</button>
  </div>

  <div v-if="suitableRounds">
    <h1>Outdoor rounds to improve your classification</h1>
    <div v-if="suitableRounds.short">
      <h2>Short</h2>
      <ul>
        <li v-for="round in suitableRounds.short" :key="round">
          {{ round.round }} ({{ round.numberOfEnds }} ends)
        </li>
      </ul>
    </div>
    <div v-if="suitableRounds.medium">
      <h2>Medium</h2>
      <ul>
        <li v-for="round in suitableRounds.medium" :key="round">
          {{ round.round }} ({{ round.numberOfEnds }} ends)
        </li>
      </ul>
    </div>
    <div v-if="suitableRounds.long">
      <h2>Long</h2>
      <ul>
        <li v-for="round in suitableRounds.long" :key="round">
          {{ round.round }} ({{ round.numberOfEnds }} ends)
        </li>
      </ul>
    </div>
  </div>

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
