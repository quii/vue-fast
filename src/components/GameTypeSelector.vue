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
  <select @change="event => $emit('changeGameType', event.target.value)">
    <option :key="type"
            :value="type"
            :selected="gameType===type"
            @change="$emit('changeGameType', type)"
            v-for="type in gameTypes">
      {{ type.toUpperCase() }}
    </option>
  </select>
</template>

<style scoped>
option {
  font-size: 1.3em;
  text-transform: capitalize;
  font-family: Helvetica, Arial, sans-serif;
}
</style>
