<script setup>
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
    <p>Tap to select round to shoot</p>
  </div>
</template>

<style scoped>
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
