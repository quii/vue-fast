<script setup>
import { computed } from "vue";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateRounds } from "@/domain/rounds";
import RoundTablePortrait from "@/components/RoundTablePortrait.vue";
import { useUserStore } from "@/stores/user";
import { calculateClassifications } from "@/domain/classification";
import { useHistoryStore } from "@/stores/history";
import { gameTypeConfig } from "@/domain/game_types";

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
const totals = computed(() => calculateSubtotals(props.scores));
const rounds = computed(() => calculateRounds(props.scores, props.gameType, props.endSize));
const userStore = useUserStore();
const history = useHistoryStore();
const pb = computed(() => history.personalBest(props.gameType));
const pointsPerEnd = computed(() => history.pointsPerEnd(props.gameType, gameTypeConfig[props.gameType].maxArrows, props.endSize));

const availableClassifications = computed(() =>
  calculateClassifications(props.gameType,
    userStore.user.gender,
    userStore.user.ageGroup,
    userStore.user.bowType,
    totals.value.totalScore
  ));
</script>

<template>
  <table>
    <thead>
    <tr>
      <th :colSpan="endSize">🎯 scores</th>
      <th>E/T</th>
    </tr>
    </thead>
    <tbody>
    <RoundTablePortrait
      v-for="(round, index) in rounds"
      :key="index+'portrait'"
      :subtotals="round.subTotals"
      :rounds="round.roundBreakdown"
      :endSize="endSize"
      :hasX="hasX"
    />
    <tr class="grand-totals">
      <td colspan="7">Grand totals</td>
    </tr>
    <tr class="grand-totals">
      <td>Hits</td>
      <td data-test="totalHits">{{ totals.hits }}</td>
      <td>Golds</td>
      <td data-test="totalGolds">{{ totals.golds }}</td>
      <td>Score</td>
      <td colspan="2">{{ totals.totalScore }}</td>
    </tr>
    </tbody>
  </table>
  <div v-if="pb">
    <table>
      <thead>
      <tr>
        <th>Personal best</th>
        <th>Avg. per end</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>{{ pb }}</td>
        <td>{{ pointsPerEnd }}</td>
      </tr>
      </tbody>
    </table>
  </div>
  <div v-if="availableClassifications">
    <table>
      <thead>
      <tr>
        <th>Classification</th>
        <th>Required score</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="index+'class'" v-for="(classification, index) in availableClassifications"
          :class="{ achieved: classification.achieved }">
        <td>{{ classification.name }}</td>
        <td>{{ classification.score }} <span class="short"
                                             v-if="classification.shortBy"> (-{{ classification.shortBy }})</span></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  table-layout: fixed;
}

.grand-totals td,
.round-subtotal td {
  font-weight: bold;
  color: var(--color-heading);
}

.achieved {
  color: green;
}

.short {
  color: red;
}
</style>
