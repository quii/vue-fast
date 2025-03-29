<script setup>
import { computed, ref, watchEffect } from "vue";
import { useUserStore } from "@/stores/user";
import { useHistoryStore } from "@/stores/history";
import { classificationList } from "@/domain/scoring/classificationList.js";

const userStore = useUserStore();
const historyStore = useHistoryStore();

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);
const name = ref(userStore.user.name) || "";
const constructiveCriticism = ref(userStore.user.constructiveCriticism ?? true);
const experimentalTargetFace = ref(userStore.user.experimentalTargetFace ?? false);
const knockColor = ref(userStore.user.knockColor ?? "#FF69B4"); // Hot pink default

// Season dates
const indoorSeasonStartDate = ref(userStore.user.indoorSeasonStartDate);
const outdoorSeasonStartDate = ref(userStore.user.outdoorSeasonStartDate);

// Classifications by bow type
const indoorClassifications = ref({ ...(userStore.user.indoorClassifications || {}) });
const outdoorClassifications = ref({ ...(userStore.user.outdoorClassifications || {}) });

// Get bow types from history using the domain method
const usedBowTypes = computed(() => {
  return historyStore.getBowTypesUsed(selectedBowtype.value);
});

// Initialize classifications for bow types
watchEffect(() => {
  usedBowTypes.value.forEach(bowType => {
    if (!indoorClassifications.value[bowType]) {
      indoorClassifications.value = {
        ...indoorClassifications.value,
        [bowType]: "Unclassified"
      };
    }
    if (!outdoorClassifications.value[bowType]) {
      outdoorClassifications.value = {
        ...outdoorClassifications.value,
        [bowType]: "Unclassified"
      };
    }
  });
});


function updateIndoorClassification(bowType, classification) {
  indoorClassifications.value = {
    ...indoorClassifications.value,
    [bowType]: classification
  };
}

function updateOutdoorClassification(bowType, classification) {
  outdoorClassifications.value = {
    ...outdoorClassifications.value,
    [bowType]: classification
  };
}

function resetSeasonDates() {
  userStore.resetSeasonDates();
  indoorSeasonStartDate.value = userStore.user.indoorSeasonStartDate;
  outdoorSeasonStartDate.value = userStore.user.outdoorSeasonStartDate;
}

watchEffect(() => {
  userStore.save(
    selectedAgeGroup.value,
    selectedGender.value,
    selectedBowtype.value,
    indoorClassifications.value,
    outdoorClassifications.value,
    indoorSeasonStartDate.value,
    outdoorSeasonStartDate.value,
    userStore.user.maxYards,
    name.value,
    constructiveCriticism.value,
    experimentalTargetFace.value,
    knockColor.value
  );
});
</script>
<template>
  <div>
    <div class="user-details-section">
      <h2>Personal Information</h2>
      <input type="text" v-model="name" placeholder="Name" />

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
    </div>

    <div class="season-dates">
      <h2>Season Dates</h2>
      <label>
        Indoor Season Start Date
        <input type="date" v-model="indoorSeasonStartDate" />
      </label>
      <label>
        Outdoor Season Start Date
        <input type="date" v-model="outdoorSeasonStartDate" />
      </label>
      <button @click="resetSeasonDates" class="reset-dates-btn">Reset to Default Dates</button>
    </div>

    <div class="classifications">
      <h2>Classifications</h2>

      <div v-for="bowType in usedBowTypes" :key="bowType" class="bow-classification">
        <div class="classification-row">
          <label>{{ bowType.charAt(0).toUpperCase() + bowType.slice(1) }} Indoor
          <select v-model="indoorClassifications[bowType]"
                  @change="updateIndoorClassification(bowType, indoorClassifications[bowType])">
            <option>Unclassified</option>
            <option v-for="option in classificationList" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select></label>
        </div>

        <div class="classification-row">
          <label>{{ bowType.charAt(0).toUpperCase() + bowType.slice(1) }} Outdoor
          <select v-model="outdoorClassifications[bowType]"
                  @change="updateOutdoorClassification(bowType, outdoorClassifications[bowType])">
            <option>Unclassified</option>
            <option v-for="option in classificationList" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select></label>
        </div>
      </div>
    </div>

    <div class="shooting-preferences">
      <h2>Other Preferences</h2>

      <label class="inline"><input type="checkbox" v-model="constructiveCriticism" /> Constructive criticism
        enabled</label>

      <label class="inline">
        <input type="checkbox" v-model="experimentalTargetFace" />
        Experimental target face scoring enabled
      </label>
      <label>Choose knock colour<input type="color" v-model="knockColor" />
      </label>
    </div>

  <div class="buymeacoffee">
    <p>Happy for you to use this for free, but if you wish to show appreciation, <a href="https://buymeacoffee.com/quii">feel free to tap here and buy me a coffee ☕️ 🥰</a></p>
  </div>
  </div>


</template>
<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  padding: 1em;
}

.classification-row, .bow-classification {
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

.user-details-section,
.season-dates,
.classifications,
.shooting-preferences {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1em;
}

.bow-classification {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1em;
  margin-bottom: 1em;
}

.bow-classification:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.bow-classification h3 {
  margin-top: 0;
  margin-bottom: 0.5em;
}

.reset-dates-btn {
  font-size: 1em;
  padding: 0.5em;
  margin-top: 0.5em;
}

h2 {
  margin-top: 0;
  font-size: 1.2em;
}

.recommended-rounds h2 {
  margin-top: 0;
  margin-bottom: 1em;
}

input, select {
  padding: 0.5em;
  font-size: 1.2em;
}
</style>
