<script setup>
import { gameTypes } from '@/domain/game_types'
defineProps({
  gameType: {
    type: String,
    required: true
  }
})
defineEmits(['changeGameType'])
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
  font-weight: bold;
}
button {
  font-size: 1.3em;
  text-transform: capitalize;
  font-family: Helvetica, Arial, sans-serif;
  background-color: white;
  border-color: lightgray;
}
</style>
