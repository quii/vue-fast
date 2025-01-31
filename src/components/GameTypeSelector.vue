<script setup>
import { gameTypes } from '@/domain/game_types'
import { useHistoryStore } from "@/stores/history";
import { computed } from "vue";

defineProps({
  gameType: {
    type: String,
    required: true
  }
})

const history = useHistoryStore();
const recentTypes = computed(() => history.getRecentGameTypes());
const otherTypes = computed(() =>
  gameTypes.filter(type => !recentTypes.value.includes(type))
);

defineEmits(['changeGameType'])
</script>
<template>
  <select @change="event => $emit('changeGameType', event.target.value)">
    <option value="" disabled selected>Select the round you're shooting</option>
    <optgroup v-if="recentTypes.length" label="Recent Rounds">
      <option v-for="type in recentTypes"
              :key="type"
              :value="type"
              :selected="gameType===type">
        {{ type.toUpperCase() }}
      </option>
    </optgroup>
    <optgroup label="All Rounds">
      <option v-for="type in otherTypes"
              :key="type"
              :value="type"
              :selected="gameType===type">
        {{ type.toUpperCase() }}
      </option>
    </optgroup>
  </select>
</template>
<style scoped>
option {
  font-size: 1.3em;
  text-transform: capitalize;
  font-family: Helvetica, Arial, sans-serif;
}
</style>
