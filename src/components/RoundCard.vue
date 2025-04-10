<script setup>
import { formatRoundName } from "@/domain/formatting.js";
import { computed } from "vue";
import { getRoundDetails } from "@/domain/round_details";
import { useHistoryStore } from "@/stores/history";
import RoundCardFull from "./RoundCardFull.vue";
import RoundCardCompact from "./RoundCardCompact.vue";

//todo: all this really needs is the round name, not an object with a round name in it
const props = defineProps({
  round: {
    type: Object,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const historyStore = useHistoryStore();

// Get round details from the domain layer
const roundDetails = computed(() => {
  return getRoundDetails(props.round.round);
});

// Format the round name
const formattedName = computed(() => {
  return formatRoundName(props.round.round);
});

// Get the user's personal best for this round
const personalBest = computed(() => {
  return historyStore.personalBest(props.round.round);
});

// Check if the user has a personal best for this round
const hasPB = computed(() => {
  return personalBest.value !== undefined;
});
</script>

<template>
  <div v-if="roundDetails" class="round-card" :class="{ 'compact-card': compact }">
    <div :class="['card-indicator', roundDetails.colorScheme]">
      <span class="indicator-text">{{ roundDetails.totalDozens }}</span>
      <span class="indicator-label">dozen</span>
    </div>

    <RoundCardCompact
      v-if="compact"
      :formattedName="formattedName"
      :roundDetails="roundDetails"
      :totalArrows="roundDetails.totalArrows"
      :personalBest="personalBest"
      :hasPB="hasPB"
    />

    <RoundCardFull
      v-else
      :formattedName="formattedName"
      :roundDetails="roundDetails"
      :totalArrows="roundDetails.totalArrows"
      :personalBest="personalBest"
      :hasPB="hasPB"
    />
  </div>
</template>

<style scoped>
.round-card {
  width: 100%;
  display: flex;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
  margin-bottom: 0.5em;
}

.round-card:active {
  transform: scale(0.98);
}

.compact-card {
  min-height: 60px; /* Reduced height for compact mode */
}

.card-indicator {
  width: 50px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75em 0;
}

.indicator-text {
  font-weight: bold;
  font-size: 1.5em;
  line-height: 1;
}

.indicator-label {
  font-size: 0.7em;
  margin-top: 0.2em;
}

/* Color schemes that work in both light and dark modes */
.imperial {
  background-color: hsla(207, 85%, 65%, 1);
  color: white;
}

.metric {
  background-color: hsla(3, 84%, 65%, 1);
  color: white;
}

.outdoor {
  background-color: hsla(145, 63%, 42%, 0.8);
  color: white;
}

.indoor {
  background-color: hsla(271, 68%, 32%, 0.8);
  color: white;
}
</style>
