<script setup>
import { computed } from "vue";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateAverageScorePerEnd, calculateRounds } from "@/domain/rounds";
import RoundTablePortrait from "@/components/RoundTablePortrait.vue";
import { useUserStore } from "@/stores/user";
import { createClassificationCalculator } from "@/domain/classification";

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
const averageScoresPerEnd = computed(() => calculateAverageScorePerEnd(props.scores, props.endSize));

const classificationCalculator = computed(() => createClassificationCalculator(
  props.gameType,
  userStore.user.gender,
  userStore.user.ageGroup,
  userStore.user.bowType
));

const availableClassifications = computed(() =>
  classificationCalculator.value(
    totals.value.totalScore,
    averageScoresPerEnd.value
  ));

const colspan = computed(() => props.endSize);

const totalColspan = computed(() => props.endSize === 5 ? 1 : 2);

</script>

<template>
  <table>
    <thead>
    <tr>
      <th :colSpan="colspan">🎯 scores</th>
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
      <td :colSpan="colspan+1">Grand totals</td>
    </tr>
    <tr class="grand-totals">
      <td>Hits</td>
      <td data-test="totalHits">{{ totals.hits }}</td>
      <td>Golds</td>
      <td data-test="totalGolds">{{ totals.golds }}</td>
      <td>Score</td>
      <td :colspan="totalColspan">{{ totals.totalScore }}</td>
    </tr>
    </tbody>
  </table>
  <div v-if="availableClassifications">
    <table>
      <thead>
      <tr>
        <th>Classification</th>
        <th>Required score</th>
        <th>Avg. per end</th>
      </tr>
      </thead>
      <tbody>
      <tr :key="index+'class'" v-for="(classification, index) in availableClassifications"
          :class="{ achieved: classification.achieved }">
        <td>{{ classification.name }}</td>
        <td>{{ classification.score }} <span class="short"
                                             v-if="classification.shortBy"> (-{{ classification.shortBy }})</span></td>
        <td>{{ classification.scorePerEnd }} <span class="avgOnTrack"
                                                   v-if="classification.perEndDiff>=0">(+{{ classification.perEndDiff }})</span><span
          class="avgOffTrack" v-if="classification.perEndDiff<0">({{ classification.perEndDiff }})</span></td>
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

.achieved, .avgOnTrack {
  color: green;
}

.short, .avgOffTrack {
  color: red;
}
</style>
