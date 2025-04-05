<script setup>
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import RoundCard from "./RoundCard.vue";
import { useRouter } from "vue-router";
import { computed } from "vue";

const props = defineProps({
  gameType: {
    type: String,
    required: true
  }
});

defineEmits(["changeGameType"]);
const router = useRouter();

// Compute whether a round is currently selected
const hasSelectedRound = computed(() => {
  return !!props.gameType;
});

function navigateToRoundSelection() {
  router.push({
    name: "selectRound",
    query: {
      returnTo: "score",
      currentRound: props.gameType
    }
  });
}
</script>

<template>
  <div class="round-selector">
    <!-- Show this when a round is selected -->
    <div v-if="hasSelectedRound" class="current-round">
      <div class="current-round-label">Currently shooting:</div>
      <ButtonGroup @click="navigateToRoundSelection">
        <RoundCard
          :round="{ round: gameType }"
        />
      </ButtonGroup>
      <BaseButton
        @click="navigateToRoundSelection"
        variant="outline"
        size="small"
      >
        Change round
      </BaseButton>
    </div>

    <!-- Show this when no round is selected -->
    <div v-else class="no-round-selected">
      <div class="select-prompt">Please select a round to shoot:</div>
      <BaseButton
        @click="navigateToRoundSelection"
        variant="primary"
      >
        Select Round
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.round-selector {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.current-round-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  color: var(--color-text);
}

.select-prompt {
  text-align: center;
  margin-bottom: 0.5rem;
}

.current-round {
  display: flex;
  flex-direction: column;
}
</style>
