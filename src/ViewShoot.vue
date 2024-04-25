<script setup>
import RoundScores from '@/components/RoundScores.vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { gameTypeConfig } from "@/domain/game_types";

const route = useRoute()
const scores = useHistoryStore()

scores.setShootToView(route.params.id)
</script>

<template>
  <h1>{{ scores.selectedShoot.gameType }} - {{ scores.selectedShoot.date }}</h1>
  <RoundScores :scores="scores.selectedShoot.scores"
               :end-size="gameTypeConfig[scores.selectedShoot.gameType].endSize"
               :game-type="scores.selectedShoot.gameType" />
</template>

<style scoped>
h1 {
  text-transform: capitalize;
  text-align: center;
}
</style>
