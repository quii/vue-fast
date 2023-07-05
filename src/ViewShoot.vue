<script setup>
import RoundScores from "@/components/RoundScores.vue";
import { useRoute } from "vue-router";
import { useHistoryStore } from "@/stores/history";

const route = useRoute()

const id = route.params.id
const scores = useHistoryStore()
scores.setShootToView(id)


</script>

<template>
  <RoundScores v-bind:rounds="scores.rounds"
               v-bind:runningTotal="scores.runningTotal"
               v-bind:totalGolds="scores.totalGolds"
               v-bind:totalHits="scores.totalHits"
  />
</template>
