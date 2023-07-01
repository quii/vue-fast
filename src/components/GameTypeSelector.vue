<script setup>
import { gameTypes } from "@/domain/game_types";
defineProps({
  gameType: {
    type: String,
    required: true
  }
});
defineEmits(["changeGameType"]);
</script>

<template>
    <button
      v-for="type in gameTypes"
      :key="type"
      :class="{ active: type === gameType }"
      @click="$emit('changeGameType', type)"
    >
      {{ type }}
    </button>
</template>

<style scoped>
.active {
  background-color: #f00;
}
button {
    font-size: 1.5em;
    text-transform: capitalize;
}
</style>
