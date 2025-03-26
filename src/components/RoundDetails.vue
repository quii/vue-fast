<script setup>
import { useGameTypeStore } from "@/stores/game_type.js";
import { useRouter } from "vue-router";
import RoundCard from "./RoundCard.vue";

defineProps({
  rounds: {
    type: Array,
    required: true
  }
});

const gameTypeStore = useGameTypeStore();
const router = useRouter();

function selectRound(round) {
  gameTypeStore.setGameType(round);
  router.push("/");
}
</script>

<template>
  <div class="rounds-container">
    <RoundCard
      v-for="round in rounds"
      :key="round.round"
      :round="round"
      @click="selectRound(round.round)"
    />
  </div>
</template>

<style scoped>
.rounds-container {
  display: flex;
  flex-direction: column;
  padding: 0;
}
</style>
