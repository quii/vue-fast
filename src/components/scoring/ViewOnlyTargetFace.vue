<script setup>
import BaseTargetFace from "./BaseTargetFace.vue";

defineProps({
  arrows: {
    type: Array,
    default: () => []
  },
  validScores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    required: true
  }
});
</script>

<template>
  <BaseTargetFace
    :arrows="arrows"
    :valid-scores="validScores"
    :game-type="gameType"
  />
</template>

<style scoped>
:deep(.arrow-marker) {
  background: #4CAF50 !important;
  opacity: 1 !important;
}
</style>