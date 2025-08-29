<template>
  <BaseCard v-if="distanceRange" @click="viewDistanceStats" class="distance-analysis-card">
    <div class="analysis-content">
      <GraphIcon class="analysis-icon" />
      <div class="analysis-text">
        <h3 class="analysis-title">Analyze Distance Performance</h3>
        <p class="analysis-subtitle">Deep dive into your {{ distanceRangeText }} shooting data</p>
        <div class="analysis-cta">
          <span class="cta-text">View detailed stats →</span>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/BaseCard.vue'
import GraphIcon from '@/components/icons/GraphIcon.vue'
import { roundConfigManager } from '@/domain/scoring/game_types'
import { yards, meters, toYards } from '@/domain/distance/distance'

const props = defineProps({
  roundName: {
    type: String,
    required: true
  }
})

const router = useRouter()

// Calculate distance range for the round
const distanceRange = computed(() => {
  const round = roundConfigManager.getRound(props.roundName)
  if (!round) return null
  
  const distances = []
  const isImperial = round.isImperial
  
  // Add max distance
  if (isImperial && round.maxDistanceYards > 0) {
    distances.push(round.maxDistanceYards)
  } else if (!isImperial && round.maxDistanceMetres > 0) {
    distances.push(round.maxDistanceMetres)
  }
  
  // Add other distances
  if (isImperial && round.otherDistancesYards) {
    distances.push(...round.otherDistancesYards)
  } else if (!isImperial && round.otherDistancesMetres) {
    distances.push(...round.otherDistancesMetres)
  }
  
  if (distances.length === 0) return null
  
  return {
    min: Math.min(...distances),
    max: Math.max(...distances),
    unit: isImperial ? 'yards' : 'meters'
  }
})

const distanceRangeText = computed(() => {
  if (!distanceRange.value) return 'distance'
  
  if (distanceRange.value.min === distanceRange.value.max) {
    return `${distanceRange.value.min} ${distanceRange.value.unit}`
  }
  return `${distanceRange.value.min}-${distanceRange.value.max} ${distanceRange.value.unit}`
})

function viewDistanceStats() {
  if (!distanceRange.value) return
  
  // Convert distances to yards for the filtering system (which always works in yards internally)
  let minDistanceYards = distanceRange.value.min
  let maxDistanceYards = distanceRange.value.max
  
  if (distanceRange.value.unit === 'meters') {
    minDistanceYards = toYards(meters(distanceRange.value.min))
    maxDistanceYards = toYards(meters(distanceRange.value.max))
  }
  
  const queryParams = new URLSearchParams({
    minDistance: Math.round(minDistanceYards).toString(),
    maxDistance: Math.round(maxDistanceYards).toString(),
    unit: distanceRange.value.unit
  })
  
  router.push(`/distance-performance?${queryParams.toString()}`)
}
</script>

<style scoped>
.distance-analysis-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.distance-analysis-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.analysis-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem;
}

.analysis-icon {
  width: 24px;
  height: 24px;
  color: var(--color-highlight, #4CAF50);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.analysis-text {
  flex: 1;
  min-width: 0; /* Allows text to wrap properly */
}

.analysis-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.analysis-subtitle {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.analysis-cta {
  margin: 0;
}

.cta-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-highlight, #4CAF50);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .analysis-content {
    padding: 0.75rem;
  }
  
  .analysis-title {
    font-size: 1rem;
  }
  
  .analysis-subtitle {
    font-size: 0.85rem;
  }
  
  .cta-text {
    font-size: 0.85rem;
  }
}
</style>