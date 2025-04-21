<script setup>
import { ref, computed, watch } from "vue";
import HistoryCard from "@/components/HistoryCard.vue";
import CompactHistoryCard from '@/components/CompactHistoryCard.vue'
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import { getAllShootStatuses } from "@/domain/shoot/shoot_status.js";
import { formatRoundName } from '@/domain/scoring/round/formatting.js'
import { useHistoryStore } from '@/stores/history'
import { useUserStore } from '@/stores/user'
const props = defineProps({
  // Common props
  visible: Boolean,
  shootData: Object,

  // Mode control
  isEditMode: {
    type: Boolean,
    default: false
  },

  // Initial values
  initialDate: {
    type: String,
    default: () => new Date().toISOString().substr(0, 10)
  },
  initialStatus: {
    type: String,
    default: "Practice"
  }
});

const emit = defineEmits(["save", "cancel"]);

// Get store instances
const historyStore = useHistoryStore()
const userStore = useUserStore()

// Local state for editing
const date = ref(props.initialDate);
const shootStatus = ref(props.initialStatus);
const recentShoots = ref([])

const isToday = computed(() => {
  const today = new Date().toISOString().substr(0, 10);
  return date.value === today;
});

const formattedRoundName = computed(() => {
  if (!props.shootData?.gameType) return ''
  return formatRoundName(props.shootData.gameType)
})

// Reset form when props change
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    date.value = props.initialDate;
    shootStatus.value = props.initialStatus;

    // Fetch recent shoots when modal becomes visible
    if (!props.isEditMode && props.shootData?.gameType) {
      fetchRecentShoots()
    }
  }
}, { immediate: true });

// Fetch recent shoots of the same game type
function fetchRecentShoots() {
  if (!props.shootData?.gameType) return

  // Use getFilteredHistory to get shoots of the same game type
  const filteredHistory = historyStore.getFilteredHistory({
    round: props.shootData.gameType
  }, userStore.user)

  // Take the most recent 3 shoots (excluding the current one if it exists)
  recentShoots.value = filteredHistory
    .filter(shoot => {
      // If the current shoot has an ID, exclude it from recent shoots
      if (props.shootData.id) {
        return shoot.id !== props.shootData.id
      }
      return true
    })
    .slice(0, 3)
}

// Computed properties for display
const modalTitle = computed(() => props.isEditMode ? "Edit Shoot" : "Save to History");
const saveButtonText = computed(() => props.isEditMode ? "Save Changes" : "Save to History");
const previewData = computed(() => {
  // Start with the original shoot data
  const baseData = props.shootData || {};

  // Create a new object with all the original properties
  return {
    ...baseData,
    // Override only the properties we're editing
    date: date.value,
    shootStatus: shootStatus.value
  };
});

// Available statuses
const shootStatuses = getAllShootStatuses();

// Check if we have recent shoots to display
const hasRecentShoots = computed(() => recentShoots.value.length > 0)

function handleSave() {
  emit("save", {
    date: date.value,
    shootStatus: shootStatus.value
  });
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <BaseModal v-if="visible" :title="modalTitle">
    <p>{{ isEditMode ? "Review your changes before saving:" : "Review your score before saving:" }}</p>

    <div class="history-preview">
      <HistoryCard :item="previewData" />
    </div>

    <!-- Recent shoots comparison (only show in save mode, not edit mode) -->
    <div v-if="!isEditMode && hasRecentShoots" class="recent-shoots">
      <h4>Last {{ recentShoots.length }} {{ formattedRoundName }} shoots:</h4>
      <div class="recent-shoots-list">
        <CompactHistoryCard
          v-for="shoot in recentShoots"
          :key="shoot.id"
          :item="shoot"
        />
      </div>
    </div>

    <!-- Date editing -->
    <div class="edit-section">
      <h4>Date:</h4>
      <div class="date-input-container">
        <input
          type="date"
          v-model="date"
          class="date-input"
        >
        <span v-if="isToday" class="today-indicator">Today</span>
      </div>
    </div>

    <!-- Shoot status selection -->
    <div class="shoot-status-selection">
      <h4>Shoot Type:</h4>
      <div class="radio-group">
        <div
          v-for="status in shootStatuses"
          :key="status"
          class="radio-option"
        >
          <input
            type="radio"
            :id="`status-${status}`"
            :value="status"
            v-model="shootStatus"
            :name="'shoot-status'"
          >
          <label :for="`status-${status}`">{{ status === "RecordStatus" ? "Record Status" : status }}</label>
        </div>
      </div>
    </div>

    <ButtonGroup>
      <BaseButton
        variant="outline"
        @click="handleCancel">
        Cancel
      </BaseButton>
      <BaseButton
        class="save-button"
        variant="primary"
        @click="handleSave">
        {{ saveButtonText }}
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<style scoped>
.history-preview {
  margin: 1.5em 0;
}

.date-input-container {
  position: relative;
  margin-bottom: 1em;
}

.date-input {
  width: 100%;
  padding: 0.75em;
  padding-right: 70px; /* Make room for the "Today" badge */
  border-radius: 6px;
  border: 1px solid var(--color-border, #ccc);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1em;
}

.date-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.shoot-status-selection {
  margin: 1.5em 0;
}

.edit-section h4, .shoot-status-selection h4, .recent-shoots h4 {
  margin-top: 0;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: var(--color-text);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.radio-option input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid var(--color-border, #ccc);
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
}

.radio-option input[type="radio"]:checked {
  border-color: var(--color-primary);
}

.radio-option input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.6em;
  height: 0.6em;
  background-color: var(--color-primary);
  border-radius: 50%;
}

.radio-option label {
  font-size: 1em;
  cursor: pointer;
}

.today-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
  pointer-events: none; /* So it doesn't interfere with the date picker */
}

/* Recent shoots styling */
.recent-shoots {
  margin: 1.5em 0;
  padding: 1em;
  background-color: var(--color-background-soft, #f5f5f5);
  border-radius: 8px;
}

.recent-shoots-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>
