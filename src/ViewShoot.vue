<script setup>
import RoundScores from '@/components/RoundScores.vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { gameTypeConfig } from "@/domain/game_types";
import { useScreenOrientation } from "@vueuse/core";
import { X } from "@/domain/scores";
import RoundScoresPortrait from "@/components/RoundScoresPortrait.vue";
import { computed } from "vue";

const route = useRoute()
const scores = useHistoryStore()
const {
  orientation
} = useScreenOrientation();


scores.setShootToView(route.params.id)

const validScores = computed(() => gameTypeConfig[scores.selectedShoot.gameType].scores);
</script>

<template>
  <h1>{{ scores.selectedShoot.gameType }} - {{ scores.selectedShoot.date }}</h1>
  <RoundScores v-if="orientation==='landscape-primary'" :scores="scores.selectedShoot.scores"
               :end-size="gameTypeConfig[scores.selectedShoot.gameType].endSize"
               :game-type="scores.selectedShoot.gameType" />
  <RoundScoresPortrait v-else :scores="scores.selectedShoot.scores"
                       :game-type="scores.selectedShoot.gameType"
                       :endSize="gameTypeConfig[scores.selectedShoot.gameType].endSize"
                       :hasX="validScores.includes(X)" />
</template>

<style scoped>
h1 {
  text-transform: capitalize;
  text-align: center;
}
</style>
