<script setup>
import { computed } from "vue";
import {useScreenOrientation} from "@vueuse/core";
import {X} from "@/domain/scores";
import {gameTypeConfig} from "@/domain/game_types";
import RoundScoresLandscape from "@/components/RoundScoresLandscape.vue";
import RoundScoresPortrait from "@/components/RoundScoresPortrait.vue";

const props = defineProps({
  scores: {
    required: true
  },
  gameType: {
    required: true
  },
  endSize: {
    required: true
  },
  hasX: {
    default: false
  }
});

const {
  orientation
} = useScreenOrientation();
const validScores = computed(() => gameTypeConfig[props.gameType].scores);

</script>

<template>
  <RoundScoresLandscape v-if="orientation==='landscape-primary'" :scores="scores"
                        :end-size="endSize"
                        :game-type="gameType" />
  <RoundScoresPortrait v-else :scores="scores"
                       :game-type="gameType"
                       :endSize="endSize"
                       :hasX="validScores.includes(X)" />
</template>
