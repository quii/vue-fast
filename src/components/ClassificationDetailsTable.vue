<script setup>
defineProps({
  availableClassifications: {
    required: true
  },
  arrowsRemaining: {
    required: true
  },
  maxPossibleScore: {
    required: true
  }
});

</script>

<template>
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
        :class="{ achieved: classification.achieved, failed: classification.score>maxPossibleScore }"

    >
      <td><span v-if="classification.achieved">✅ </span>{{ classification.name }}</td>
      <td>{{ classification.score }} <span class="short"
                                           v-if="classification.shortBy"> (-{{ classification.shortBy }})</span>
      </td>
      <td>{{ classification.scorePerEnd }} <span class="avgOnTrack"
                                                 v-if="classification.perEndDiff>=0">(+{{ classification.perEndDiff
        }})</span><span
        class="avgOffTrack" v-if="classification.perEndDiff<0">({{ classification.perEndDiff }})</span></td>
    </tr>
    <tr>
      <td colspan="2">Arrows remaining</td>
      <td>{{ arrowsRemaining }}</td>
    </tr>
    <tr>
      <td colspan="2">Max possible score</td>
      <td>{{ maxPossibleScore }}</td>
    </tr>
    </tbody>
  </table>
</template>


<style scoped>
.detailsHint p {
  padding: 0.5em;
  font-size: 1.1em
}

.achieved, .avgOnTrack {
  color: green;
}

.short, .avgOffTrack {
  color: red;
}

.failed {
  text-decoration: line-through;
}

details + details {
  border-top: none;
}

details[open] {
  padding-bottom: 1em;
}

summary {
  padding: 1rem 1em 1rem 0.7rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
