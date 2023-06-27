<script setup>
import { validScores } from "@/domain/scores";

defineEmits(["score"]);
</script>

<template>
  <button v-for="score in validScores"
          :key="score"
          @click="$emit('score', score)">{{ score }}
  </button>
</template>

