<script setup>
import { computed, ref, watchEffect, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useHistoryStore } from "@/stores/history";
import RoundDetails from "@/components/RoundDetails.vue";
import { classificationList } from "@/domain/scoring/classificationList.js";
import { calculateAppropriateRounds } from "@/domain/scoring/game_types.js";

const userStore = useUserStore();
const historyStore = useHistoryStore();

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);
const name = ref(userStore.user.name) || "";
const maxYards = ref(userStore.user.maxYards ?? 100);
const constructiveCriticism = ref(userStore.user.constructiveCriticism ?? true);
const experimentalTargetFace = ref(userStore.user.experimentalTargetFace ?? false);
const knockColor = ref(userStore.user.knockColor ?? "#FF69B4"); // Hot pink default

// Season dates
const indoorSeasonStartDate = ref(userStore.user.indoorSeasonStartDate);
const outdoorSeasonStartDate = ref(userStore.user.outdoorSeasonStartDate);

// Classifications by bow type
const indoorClassifications = ref({ ...(userStore.user.indoorClassifications || {}) });
const outdoorClassifications = ref({ ...(userStore.user.outdoorClassifications || {}) });

// Bow types the archer has used
const usedBowTypes = ref([]);

// Get bow types from history
onMounted(() => {
  const history = historyStore.history;
  const bowTypesSet = new Set();

  history.forEach(item => {
    if (item.userProfile?.bowType) {
      bowTypesSet.add(item.userProfile.bowType);
    }
  });

  // Add current bow type if not in history
  if (selectedBowtype.value) {
    bowTypesSet.add(selectedBowtype.value);
  }

  usedBowTypes.value = Array.from(bowTypesSet);

  // Initialize classifications for bow types if not already set
  updateClassificationsForBowTypes();
});

// Watch for changes to selectedBowtype and update usedBowTypes
watchEffect(() => {
  if (selectedBowtype.value && !usedBowTypes.value.includes(selectedBowtype.value)) {
    usedBowTypes.value = [...usedBowTypes.value, selectedBowtype.value];
    updateClassificationsForBowTypes();
  }
});

// Helper function to initialize classifications for bow types
function updateClassificationsForBowTypes() {
  usedBowTypes.value.forEach(bowType => {
    if (!indoorClassifications.value[bowType]) {
      indoorClassifications.value[bowType] = "Unclassified";
    }
    if (!outdoorClassifications.value[bowType]) {
      outdoorClassifications.value[bowType] = "Unclassified";
    }
  });
}

const allArcherDetailsProvided = computed(() => selectedAgeGroup.value &&
  selectedGender.value &&
  selectedBowtype.value
);

const suitableRounds = ref({ short: [], medium: [], long: [] });

watchEffect(async () => {
  if (allArcherDetailsProvided.value) {
    // Always use the outdoor classification for suitable rounds
    const currentClassification = outdoorClassifications.value[selectedBowtype.value] || "Unclassified";

    suitableRounds.value = await calculateAppropriateRounds(
      currentClassification,
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
    maxYards.value,
    name.value,
    constructiveCriticism.value,
    experimentalTargetFace.value,
    knockColor.value
  );
});
</script>
<template>
  <div>
    <h1>Your details</h1>
    <p>These details are used by the app to tell you your progress on classifications while you're shooting.</p>
    <p>This app is not an official record! You will have to report your scores to your records officer in the usual way.</p>

    <div class="user-details-section">
      <h2>Personal Information</h2>
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
        <h3>{{ bowType.charAt(0).toUpperCase() + bowType.slice(1) }}</h3>

        <div class="classification-row">
          <label>Indoor</label>
          <select v-model="indoorClassifications[bowType]"
                  @change="updateIndoorClassification(bowType, indoorClassifications[bowType])">
            <option>Unclassified</option>
            <option v-for="option in classificationList" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div class="classification-row">
          <label>Outdoor</label>
          <select v-model="outdoorClassifications[bowType]"
                  @change="updateOutdoorClassification(bowType, outdoorClassifications[bowType])">
            <option>Unclassified</option>
            <option v-for="option in classificationList" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="shooting-preferences">
      <h2>Shooting Preferences</h2>
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
    <h2>Suggested outdoor rounds</h2>
    <div class="sub" v-if="suitableRounds.short">
      <h3>Short shoot(s)</h3>
      <RoundDetails :rounds="suitableRounds.short"></RoundDetails>
    </div>
    <div class="sub" v-if="suitableRounds.medium">
      <h3>Medium shoot(s)</h3>
      <RoundDetails :rounds="suitableRounds.medium"></RoundDetails>
    </div>
    <div class="sub" v-if="suitableRounds.long">
      <h3>Long shoot(s)</h3>
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

.user-details-section,
.season-dates,
.classifications,
.shooting-preferences,
.recommended-rounds {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1em;
  margin-top: 1em;
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

.classification-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  padding: 0.5em 0;
}

.classification-row:first-of-type {
  margin-top: 0;
}

.classification-row label {
  width: 80px;
  flex-direction: row;
}

.reset-dates-btn {
  font-size: 1em;
  padding: 0.5em;
  margin-top: 0.5em;
}

h2 {
  margin-top: 0;
  margin-bottom: 0.5em;
  font-size: 1.2em;
}
</style>
