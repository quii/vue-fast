<script setup>
import { calculateTotal, scoresPerEnd } from "../domain/scores";

defineProps({
  scores: {
    type: Array,
    required: true
  }
})

</script>

<template>
    <td v-for="i in scoresPerEnd" :key="i">{{scores[i-1]}}</td>
    <td>{{calculateTotal(scores)}}</td>
</template>

<style scoped>
</style>
