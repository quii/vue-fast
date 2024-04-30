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
const history = useHistoryStore()
const {
  orientation
} = useScreenOrientation();


history.setShootToView(route.params.id)

const validScores = computed(() => gameTypeConfig[history.selectedShoot.gameType].scores);
const endSize = computed(() => gameTypeConfig[history.selectedShoot.gameType].endSize)
const scores = computed(() => history.selectedShoot.scores)
const gameType = computed(() => history.selectedShoot.gameType)
const date = computed(() => history.selectedShoot.date)
</script>

<template>
  <h1>{{ gameType }} - {{ date }}</h1>
  <RoundScores v-if="orientation==='landscape-primary'" :scores="scores"
               :end-size="endSize"
               :game-type="gameType" />
  <RoundScoresPortrait v-else :scores="scores"
                       :game-type="gameType"
                       :endSize="endSize"
                       :hasX="validScores.includes(X)" />
</template>

<style scoped>
h1 {
  text-transform: capitalize;
  text-align: center;
}
</style>
