<script setup>
import CloudBackupSection from '@/components/CloudBackupSection.vue'
import { calculateDefaultSeasonDates } from "@/domain/season_dates.js";
import { useHistoryStore } from "@/stores/history";
import { useNotesStore } from "@/stores/user_notes";
import { useUserStore } from "@/stores/user";
import { useToast } from "vue-toastification";
import { computed, ref } from 'vue'
import SectionCard from "@/components/ui/SectionCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from '@/components/ui/BaseInput.vue'
import FormGroup from '@/components/ui/FormGroup.vue'

const history = useHistoryStore();
const notes = useNotesStore();
const user = useUserStore();
const toast = useToast();

const backupWarning = computed(() => user.needsBackup());
const userName = ref(user.user.name || '')
const hasName = computed(() => user.user.name && user.user.name.trim() !== '')

function saveUserName() {
  if (!userName.value.trim()) {
    toast.error('Please enter your name')
    return
  }

  // Save the user's name while preserving other user settings
  user.save(
    user.user.ageGroup,
    user.user.gender,
    user.user.bowType,
    user.user.indoorClassifications,
    user.user.outdoorClassifications,
    user.user.indoorSeasonStartDate,
    user.user.outdoorSeasonStartDate,
    userName.value.trim(),
    user.user.constructiveCriticism,
    user.user.experimentalTargetFace,
    user.user.knockColor
  )

  toast.success('Name saved successfully')
}

function exportData() {
  const data = {
    history: history.history,
    notes: notes.notes,
    user: user.user
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `archery-data-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  user.updateLastBackupDate();

  toast.success("Data exported successfully");
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      history.importHistory(data.history,
        { ageGroup: data.user.ageGroup, bowType: data.user.bowType, gender: data.user.gender });
      notes.importNotes(data);

      // Handle potential missing fields in older backup files
      let indoorClassifications = data.user.indoorClassifications || {};
      let outdoorClassifications = data.user.outdoorClassifications || {};

      // Migrate old classification to new schema if needed
      if (data.user.classification && data.user.bowType &&
        (!outdoorClassifications[data.user.bowType] || outdoorClassifications[data.user.bowType] === "Unclassified")) {
        // If we have an old classification and bow type, and no corresponding outdoor classification,
        // use the old classification as the outdoor classification for that bow type
        outdoorClassifications = {
          ...outdoorClassifications,
          [data.user.bowType]: data.user.classification
        };

        // If we don't have an indoor classification for this bow type, initialize it as Unclassified
        if (!indoorClassifications[data.user.bowType]) {
          indoorClassifications = {
            ...indoorClassifications,
            [data.user.bowType]: "Unclassified"
          };
        }
      }

      // Use default season dates if not present in the backup
      const defaultSeasons = calculateDefaultSeasonDates();
      const indoorSeasonStartDate = data.user.indoorSeasonStartDate || defaultSeasons.indoor;
      const outdoorSeasonStartDate = data.user.outdoorSeasonStartDate || defaultSeasons.outdoor;

      // Other fields with defaults
      const name = data.user.name || "";
      const constructiveCriticism = data.user.constructiveCriticism !== undefined ? data.user.constructiveCriticism : true;
      const experimentalTargetFace = data.user.experimentalTargetFace || false;
      const knockColor = data.user.knockColor || "#FF69B4";

      user.save(
        data.user.ageGroup,
        data.user.gender,
        data.user.bowType,
        indoorClassifications,
        outdoorClassifications,
        indoorSeasonStartDate,
        outdoorSeasonStartDate,
        name,
        constructiveCriticism,
        experimentalTargetFace,
        knockColor
      );
      user.updateLastBackupDate();
      toast.success("Data imported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error importing data");
    }
  };

  reader.readAsText(file);
}

function hardReset() {
  if (confirm("Are you sure you want to clear all your data?")) {
    if (confirm("Yeah but really? This cannot be reversed")) {
      localStorage.clear();
      toast.info("Local data removed");
    }
  }
}
</script>

<template>
  <div class="data-management">
    <SectionCard v-if="backupWarning" class="warning-card" title="Time for a backup!">
      <div class="warning-content">
        <p class="explanation">
          It's been over a month since your last backup. Please save a new backup file to keep your data safe.
        </p>
      </div>
    </SectionCard>

    <SectionCard title="Back up your data">
      <p class="explanation">
        Your scores and notes are only stored on this device. To keep them safe, download a backup file and store it
        somewhere secure.
      </p>
      <BaseButton
        variant="primary"
        @click="exportData"
        fullWidth
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </template>
        Save backup file
      </BaseButton>
    </SectionCard>

    <SectionCard title="Restore from backup">
      <p class="explanation">
        Use this to restore your data from a previous backup file.
      </p>
      <div class="file-upload-container">
        <input type="file"
               accept=".json"
               @change="handleFileUpload"
               data-test="file-upload"
               class="file-input" />
      </div>
    </SectionCard>

    <SectionCard class="danger-card" title="Delete all data">
      <div class="warning-content">
        <h3 class="warning-title">⚠️ This will remove everything</h3>
        <p class="explanation">
          This will erase all your scores, notes and settings. Make sure you have a backup first!
        </p>
      </div>
      <BaseButton
        variant="danger"
        @click="hardReset"
        fullWidth
      >
        Reset all data
      </BaseButton>
    </SectionCard>

    <!-- Cloud Backup Section -->
    <template v-if="hasName">
      <SectionCard title="Cloud Backup">
        <CloudBackupSection />
      </SectionCard>
    </template>
    <template v-else>
      <SectionCard title="Enable Cloud Backup">
        <p class="explanation">
          Cloud backup allows you to access your archery data across multiple devices and provides an extra layer of
          protection for your scores.
        </p>
        <p class="explanation">
          To enable cloud backup, please enter your name below:
        </p>
        <FormGroup label="Your Name">
          <BaseInput
            v-model="userName"
            placeholder="Enter your name"
            type="text"
          />
        </FormGroup>
        <BaseButton
          variant="primary"
          @click="saveUserName"
          fullWidth
          class="save-name-button"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="button-icon">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </template>
          Save Name & Enable Cloud Backup
        </BaseButton>
      </SectionCard>
    </template>
  </div>
</template>

<style scoped>
.data-management {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.explanation {
  margin-bottom: 1rem;
  line-height: 1.4;
  color: var(--color-text);
}

.warning-card {
  background-color: rgba(255, 204, 0, 0.1);
  border-left: 4px solid #ffcc00;
}

.danger-card {
  background-color: rgba(255, 59, 48, 0.1);
  border-left: 4px solid #ff3b30;
}

.warning-content {
  margin-bottom: 1rem;
}

.warning-title {
  color: #ff3b30;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.file-upload-container {
  margin-top: 1rem;
}

.file-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
}

.button-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
}

.save-name-button {
  margin-top: 1rem;
}
</style>
