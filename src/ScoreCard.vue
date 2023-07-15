<script setup>
import { useScoresStore } from '@/stores/scores'
import RoundScores from '@/components/RoundScores.vue'
import ScoreButtons from '@/components/ScoreButtons.vue'
import GameTypeSelector from '@/components/GameTypeSelector.vue'
import { validScores } from '@/domain/scores'
import { useGameTypeStore } from '@/stores/game_type'

const scoresStore = useScoresStore()
const gameTypeStore = useGameTypeStore()
</script>

<template>
  <ScoreButtons :validScores="validScores" @score="scoresStore.add" @undo="scoresStore.undo" />
  <RoundScores :scores="scoresStore.scores" :game-type="gameTypeStore.type" />
  <div class="controls">
    <GameTypeSelector :gameType="gameTypeStore.type" @changeGameType="gameTypeStore.setGameType" />
    <button @click="scoresStore.clear()">Clear data</button>
  </div>
</template>

<style scoped>
.controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.controls button {
  padding: 0.5em;
  font-size: 1.5em;
  flex: 1 1 0;
}
</style>
