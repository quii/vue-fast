<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const toast = useToast();

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);

function saveUserDetails(event) {
  event.preventDefault();
  userStore.save(selectedAgeGroup, selectedGender, selectedBowtype);
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
    <button type="submit" @click="saveUserDetails">💾 Save</button>
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
