<script setup>
import { computed } from "vue";
import { formatShootDuration } from "@/utils/duration.ts";
import { openInMaps, canOpenInMaps } from "@/utils/maps.ts";
import MapIcon from "@/components/icons/MapIcon.vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  ageGroup: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    default: ""
  },
  bowType: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "Practice"
  },
  handicap: {
    type: Number,
    default: null
  },
  classification: {
    type: Object,
    default: null
  },
  location: {
    type: Object,
    default: null
  },
  shootDuration: {
    type: Number,
    default: null
  }
});

// Capitalize the first letter of each word
function capitalize(str) {
  if (!str) return "";
  return str.split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const capitalizedName = computed(() => capitalize(props.name));
const capitalizedBowType = computed(() => capitalize(props.bowType));
const capitalizedGender = computed(() => capitalize(props.gender));
const capitalizedAgeGroup = computed(() => capitalize(props.ageGroup));

const formattedDuration = computed(() => {
  return formatShootDuration(props.shootDuration);
});

const isLocationClickable = computed(() => {
  return canOpenInMaps(props.location);
});

function handleLocationClick() {
  if (props.location && canOpenInMaps(props.location)) {
    openInMaps(props.location);
  }
}
</script>

<template>
  <div class="archer-details">
    <div class="info-chips">
      <div class="info-chip">{{ capitalizedName }}</div>
      <div v-if="bowType" class="info-chip">{{ capitalizedBowType }}</div>
      <div v-if="gender" class="info-chip">{{ capitalizedGender }}</div>
      <div v-if="ageGroup" class="info-chip">{{ capitalizedAgeGroup }}</div>
      <div v-if="status" class="info-chip">{{ status }}</div>
      <div v-if="handicap !== null" class="info-chip">Handicap: {{ handicap }}</div>
      <div v-if="classification && classification.name" class="info-chip">
        {{ classification.name }} ({{ classification.scheme }})
      </div>
      <button 
        v-if="location && location.placeName" 
        class="info-chip location-button"
        :disabled="!isLocationClickable"
        @click="handleLocationClick"
        :title="isLocationClickable ? 'Tap to open in maps' : ''"
      >
        <MapIcon class="location-icon" />
        {{ location.placeName }}
      </button>
      <div v-if="formattedDuration" class="info-chip duration-chip">
        {{ formattedDuration }}
      </div>
    </div>
  </div>
</template>

<style scoped>

.info-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.info-chip {
  background-color: var(--color-background-mute);
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text);
}

.location-chip {
  background-color: var(--color-background-soft);
  color: var(--color-text-light);
  font-style: italic;
}

.location-button {
  background-color: var(--color-highlight, #4CAF50);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-style: normal;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.location-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.location-button:hover:not(:disabled) {
  background-color: var(--color-highlight-bright, #5FDF63);
  transform: translateY(-1px);
}

.location-button:active:not(:disabled) {
  transform: scale(0.98);
}

.location-button:disabled {
  background-color: var(--color-background-soft);
  color: var(--color-text-light);
  cursor: not-allowed;
  opacity: 0.6;
  font-style: italic;
}

.duration-chip {
  background-color: var(--color-background-soft);
  color: var(--color-text-light);
  font-weight: 500;
}

@media (min-width: 768px) {
  .info-chips {
    gap: 0.5rem;
  }
}
</style>
