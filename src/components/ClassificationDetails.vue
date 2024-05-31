<script setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { createClassificationCalculator } from "@/domain/classification";
import { calculateSubtotals } from "@/domain/subtotals";
import { calculateAverageScorePerEnd } from "@/domain/rounds";

const props = defineProps({
  scores: {
    required: true
  },
  gameType: {
    required: true
  },
  endSize: {
    required: true
  }
});

const userStore = useUserStore();

const classificationCalculator = computed(() => createClassificationCalculator(
  props.gameType,
  userStore.user.gender,
  userStore.user.ageGroup,
  userStore.user.bowType
));

const totals = computed(() => calculateSubtotals(props.scores));
const averageScoresPerEnd = computed(() => calculateAverageScorePerEnd(props.scores, props.endSize));


const availableClassifications = computed(() => {
  return classificationCalculator.value?.(
      totals.value.totalScore,
      averageScoresPerEnd.value
  );
});
</script>

<template>
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
                                                   v-if="classification.perEndDiff>=0">(+{{ classification.perEndDiff
          }})</span><span
          class="avgOffTrack" v-if="classification.perEndDiff<0">({{ classification.perEndDiff }})</span></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>


<style scoped>
.achieved, .avgOnTrack {
  color: green;
}

.short, .avgOffTrack {
  color: red;
}
</style>
