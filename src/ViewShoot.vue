<script setup>
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { gameTypeConfig } from "@/domain/game_types";
import { computed } from "vue";
import RoundScores from "@/components/RoundScores.vue";

const route = useRoute()
const history = useHistoryStore()
history.setShootToView(route.params.id)

const endSize = computed(() => gameTypeConfig[history.selectedShoot.gameType].endSize)
const scores = computed(() => history.selectedShoot.scores)
const gameType = computed(() => history.selectedShoot.gameType)
const date = computed(() => history.selectedShoot.date)
</script>

<template>
  <h1>{{ gameType }} - {{ date }}</h1>
  <RoundScores :scores="scores"
               :end-size="endSize"
               :game-type="gameType" />
</template>

<style scoped>
h1 {
  text-transform: capitalize;
  text-align: center;
}
</style>
