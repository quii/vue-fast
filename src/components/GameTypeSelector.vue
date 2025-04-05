<script setup>
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import RoundCard from "./RoundCard.vue";
import { useRouter } from "vue-router";

const props = defineProps({  // Make sure to assign to a variable
  gameType: {
    type: String,
    required: true
  }
});

defineEmits(["changeGameType"]);
const router = useRouter();

function navigateToRoundSelection() {
  router.push({
    name: "selectRound",
    query: {
      returnTo: "score",
      currentRound: props.gameType  // Now using props.gameType
    }
  });
}
</script>

<template>
  <div>
    <!-- Replace button with RoundCard for the currently selected round -->
    <div class="current-round-container" @click="navigateToRoundSelection">
      <RoundCard
        v-if="gameType"
        :round="{ round: gameType }"
      />
      <div v-else class="select-placeholder">
        <span>Select the round you're shooting</span>
      </div>
    </div>
    <ButtonGroup class="compact-button-group">
      <BaseButton @click="navigateToRoundSelection">
        <!-- Simple arrow right icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="tap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
        Tap to select round to shoot
      </BaseButton>
    </ButtonGroup>
  </div>
</template>

<style scoped>

.tap-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

/* Target the button inside our custom ButtonGroup */
.compact-button-group :deep(button) {
  margin-top: 0;
  margin-bottom: 0;
}
p {
  text-align: right;
  padding-bottom: 1rem;
  padding-right: 0.5rem;
  font-size: 0.8rem;
}
.current-round-container {
  cursor: pointer;
  transition: transform 0.1s ease;
  margin-top:0.5rem;
}

.current-round-container:active {
  transform: scale(0.98);
}

.select-placeholder {
  width: 100%;
  padding: 1.5em;
  font-size: 1.2em;
  text-align: center;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-light);
}

.search-container input {
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

</style>
