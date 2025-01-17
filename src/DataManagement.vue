<script setup>

import { useHistoryStore } from "@/stores/history";
import { useNotesStore } from "@/stores/user_notes";
import { useUserStore } from "@/stores/user";
import { useToast } from "vue-toastification";
import { computed } from "vue";

const history = useHistoryStore();
const notes = useNotesStore();
const user = useUserStore();
const toast = useToast();

const backupWarning = computed(() => user.needsBackup());

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
      history.importHistory(data.history);
      notes.importNotes(data);
      user.save(
        data.user.ageGroup,
        data.user.gender,
        data.user.bowType,
        data.user.classification,
        data.user.maxYards,
        data.user.name,
        data.user.constructiveCriticism
      );
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
    <div v-if="backupWarning" class="section warning">
      <h2>⚠️ Time for a backup!</h2>
      <p class="explanation">
        It's been over a month since your last backup. Please save a new backup file to keep your data safe.
      </p>
    </div>

    <div class="section">
      <h1>Back up your data</h1>
      <p class="explanation">
        Your scores and notes are only stored on this device. To keep them safe, download a backup file and store it
        somewhere secure.
      </p>
      <button type="button" @click="exportData">📥 Save backup file</button>
    </div>

    <div class="section">
      <h1>Restore from backup</h1>
      <p class="explanation">
        Use this to restore your data from a previous backup file.
      </p>
      <input type="file"
             accept=".json"
             @change="handleFileUpload"
             data-test="file-upload" />
    </div>

    <div class="section danger">
      <h1>Delete all data</h1>
      <h2>⚠️ This will remove everything</h2>
      <p class="explanation">
        This will erase all your scores, notes and settings. Make sure you have a backup first!
      </p>
      <button type="button" @click="hardReset">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.data-management {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--color-background-soft);
}

.section h1 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.explanation {
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.section button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.2rem;
}

.section input[type="file"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: 4px;
}

.danger {
  background: rgba(255, 0, 0, 0.1);
}

.danger h2 {
  color: #ff4444;
  margin-bottom: 0.5rem;
}
</style>


