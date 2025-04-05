<script setup>
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import RoundCard from "./RoundCard.vue";
import { useRouter } from "vue-router";

const props = defineProps({  // Make sure to assign to a variable
  gameType: {
    type: String,
    required: true
  }
});

defineEmits(["changeGameType"]);
const router = useRouter();

function navigateToRoundSelection() {
  router.push({
    name: "selectRound",
    query: {
      returnTo: "score",
      currentRound: props.gameType  // Now using props.gameType
    }
  });
}
</script>

<template>
  <div>
    <ButtonGroup @click="navigateToRoundSelection">
      <RoundCard
        v-if="gameType"
        :round="{ round: gameType }"
      />
    </ButtonGroup>
    <ButtonGroup class="compact-button-group">
      <BaseButton @click="navigateToRoundSelection">
        Tap to select round to shoot
      </BaseButton>
    </ButtonGroup>
  </div>
</template>

<style scoped>
.compact-button-group {
  margin-top: 0;
}
.compact-button-group :deep(button) {
  margin-top: 0;
  margin-bottom: 0;
}
</style>
