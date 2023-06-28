<script setup>
import { gameTypes } from "@/domain/game_types";
defineProps({
  gameType: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="game-type-selector">
    <button
      v-for="type in gameTypes"
      :key="type"
      :class="{ active: type === gameType }"
      @click="$emit('changeGameType', type)"
    >
      {{ type }}
    </button>
  </div>
</template>

<style scoped>
.game-type-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.active {
  background-color: #f00;
}
</style>
