<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useUserStore } from "@/stores/user";
import { useHistoryStore } from "@/stores/history";
import { useInstallationStore } from '@/stores/installation'
import { classificationList, classificationListWithoutPB } from "@/domain/scoring/classificationList.js";
import SectionCard from "@/components/ui/SectionCard.vue";
import FormGroup from "@/components/ui/FormGroup.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import BaseCheckbox from "@/components/ui/BaseCheckbox.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import WebSocketStats from '@/components/debug/WebSocketStats.vue'

const userStore = useUserStore();
const historyStore = useHistoryStore();
const installationStore = useInstallationStore()

const selectedAgeGroup = ref(userStore.user.ageGroup);
const selectedGender = ref(userStore.user.gender);
const selectedBowtype = ref(userStore.user.bowType);
const name = ref(userStore.user.name) || "";
const constructiveCriticism = ref(userStore.user.constructiveCriticism ?? true);
const experimentalTargetFace = ref(userStore.user.experimentalTargetFace ?? false);
const knockColor = ref(userStore.user.knockColor ?? "#FF69B4"); // Hot pink default
const showDevTools = ref(installationStore.showDevTools)
const baseURL = window.location.origin;
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

// Check if we're in development mode
const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development'
})

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

function toggleDevTools(value) {
  installationStore.toggleDevTools(value)
}

watch(showDevTools, (newValue) => {
  console.log('UserData: showDevTools changed to:', newValue)
  toggleDevTools(newValue)
})

watchEffect(() => {
  userStore.save(
    selectedAgeGroup.value,
    selectedGender.value,
    selectedBowtype.value,
    indoorClassifications.value,
    outdoorClassifications.value,
    indoorSeasonStartDate.value,
    outdoorSeasonStartDate.value,
    name.value,
    constructiveCriticism.value,
    experimentalTargetFace.value,
    knockColor.value
  );
});
</script>
<template>
  <div class="profile-page">
    <SectionCard title="Personal Information">
      <FormGroup label="Name">
        <BaseInput v-model="name" placeholder="Name" />
      </FormGroup>

      <FormGroup label="Age Group">
        <BaseSelect v-model="selectedAgeGroup">
          <option disabled value="">Select age group</option>
          <option>50+</option>
          <option value="senior">Senior</option>
          <option value="u21">Under 21</option>
          <option value="u18">Under 18</option>
          <option value="u16">Under 16</option>
          <option value="u15">Under 15</option>
          <option value="u14">Under 14</option>
          <option value="u12">Under 12</option>
        </BaseSelect>
      </FormGroup>

      <FormGroup label="Gender">
        <BaseSelect v-model="selectedGender">
          <option disabled value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </BaseSelect>
      </FormGroup>

      <FormGroup label="Bow Type">
        <BaseSelect v-model="selectedBowtype">
          <option disabled value="">Select bow type</option>
          <option value="recurve">Recurve</option>
          <option value="barebow">Barebow</option>
          <option value="longbow">Longbow</option>
          <option value="compound">Compound</option>
        </BaseSelect>
      </FormGroup>
    </SectionCard>

    <SectionCard title="Season Dates">
      <FormGroup label="Indoor Season Start Date">
        <BaseInput type="date" v-model="indoorSeasonStartDate" />
      </FormGroup>

      <FormGroup label="Outdoor Season Start Date">
        <BaseInput type="date" v-model="outdoorSeasonStartDate" />
      </FormGroup>

      <BaseButton
        variant="outline"
        @click="resetSeasonDates"
        fullWidth
      >
        Reset to Default Dates
      </BaseButton>
    </SectionCard>

    <SectionCard title="Classifications" v-if="usedBowTypes.length > 0">
      <div v-for="bowType in usedBowTypes" :key="bowType" class="bow-classification">
        <h3 class="bow-type-title">{{ bowType.charAt(0).toUpperCase() + bowType.slice(1) }}</h3>

        <FormGroup :label="`${bowType.charAt(0).toUpperCase() + bowType.slice(1)} Indoor`">
          <BaseSelect
            v-model="indoorClassifications[bowType]"
            @change="updateIndoorClassification(bowType, indoorClassifications[bowType])"
          >
            <option>Unclassified</option>
            <option v-for="option in classificationListWithoutPB" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </BaseSelect>
        </FormGroup>

        <FormGroup :label="`${bowType.charAt(0).toUpperCase() + bowType.slice(1)} Outdoor`">
          <BaseSelect
            v-model="outdoorClassifications[bowType]"
            @change="updateOutdoorClassification(bowType, outdoorClassifications[bowType])"
          >
            <option>Unclassified</option>
            <option v-for="option in classificationListWithoutPB" :value="option" v-bind:key="option">
              {{ option }}
            </option>
          </BaseSelect>
        </FormGroup>
      </div>
    </SectionCard>

    <SectionCard title="Other Preferences">
      <ThemeToggle label="App Theme" />
      <BaseCheckbox
        v-model="constructiveCriticism"
        label="Constructive criticism enabled"
      />

      <BaseCheckbox
        v-model="experimentalTargetFace"
        label="Experimental target face scoring enabled"
      />

      <FormGroup label="Choose knock colour">
        <BaseInput type="color" v-model="knockColor" />
      </FormGroup>

      <!-- Add the DevTools checkbox -->
      <BaseCheckbox
        v-if="isDevelopment"
        v-model="showDevTools"
        label="Show developer tools"
      />
    </SectionCard>

    <SectionCard title="Share Fast">
      <img class="qr" src="/qr.png" />
      <a class="qr" href="baseURL" target="_blank">{{ baseURL }}</a>
    </SectionCard>

    <WebSocketStats />

    <SectionCard title="Buy me a coffee?">
      <p>Happy for you to use Fast for free, but if you wish to show appreciation, <a
        href="https://buymeacoffee.com/quii">feel free to tap here and buy me a coffee ☕️ 🥰</a></p>
    </SectionCard>
  </div>
</template>
<style scoped>
.qr {
  margin: 0 auto;
  display: block;
  text-align: center;
}
.profile-page {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.bow-type-title {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: var(--color-text-light);
}

.bow-classification {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-light);
}

.bow-classification:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.buymeacoffee {
  margin-top: 2rem;
  padding: 1rem;
  text-align: center;
  background-color: var(--color-background-soft);
  border-radius: 8px;
}

.buymeacoffee a {
  color: var(--color-highlight);
  text-decoration: none;
}

.buymeacoffee a:hover {
  text-decoration: underline;
}
</style>
