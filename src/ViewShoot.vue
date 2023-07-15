<script setup>
import RoundScores from '@/components/RoundScores.vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history'

const route = useRoute()
const scores = useHistoryStore()

scores.setShootToView(route.params.id)
</script>

<template>
  <h1>{{ scores.selectedShoot.gameType }} - {{ scores.selectedShoot.date }}</h1>
  <RoundScores :scores="scores.selectedShoot.scores" :game-type="scores.selectedShoot.gameType" />
</template>

<style scoped>
h1 {
  text-transform: capitalize;
  text-align: center;
}
</style>
