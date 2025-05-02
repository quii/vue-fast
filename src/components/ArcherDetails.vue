<script setup>
import { computed } from "vue";

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

@media (min-width: 768px) {
  .info-chips {
    gap: 0.5rem;
  }
}
</style>
