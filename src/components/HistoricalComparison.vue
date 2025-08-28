<template>
  <BaseCard v-if="comparison" class="historical-comparison">
    <!-- Individual Historical Comparisons -->
    <div class="historical-shoots-section">
      <h4>Compared to previous {{ comparison.historicalComparisons.length }} shoots</h4>
      <div class="shoot-comparisons">
        <div
          v-for="(historical, index) in fullHistoricalShoots"
          :key="`historical-${historical.shoot.id}`"
          class="shoot-comparison"
        >
          <!-- History Card for shoot details -->
          <HistoryCard :item="historical.fullShoot" @click="navigateToShoot(historical.shoot.id)" />
          
          <!-- Comparison table -->
          <div class="comparison-table">
            <div class="table-header">
              <span class="metric-label">Metric</span>
              <span v-if="historical.distances.length > 1" class="distance-headers">
                <span v-for="(distance, distIndex) in historical.distances" :key="`header-${distIndex}`" class="distance-header">
                  {{ distance.distance }}{{ distance.unit }}
                </span>
              </span>
              <span v-else class="single-distance-header">Difference</span>
            </div>
            
            <div class="table-row">
              <span class="metric-label">Avg End total</span>
              <span v-if="historical.distances.length > 1" class="distance-values">
                <span v-for="(distance, distIndex) in historical.distances" :key="`end-${distIndex}`" 
                      class="diff-value" :class="differenceClass(distance.averageEndTotalDifference)">
                  {{ formatDifference(distance.averageEndTotalDifference, 1) }}
                </span>
              </span>
              <span v-else class="diff-value" :class="differenceClass(historical.distances[0].averageEndTotalDifference)">
                {{ formatDifference(historical.distances[0].averageEndTotalDifference, 1) }}
              </span>
            </div>

            <div class="table-row">
              <span class="metric-label">Avg arrow value</span>
              <span v-if="historical.distances.length > 1" class="distance-values">
                <span v-for="(distance, distIndex) in historical.distances" :key="`arrow-${distIndex}`" 
                      class="diff-value" :class="differenceClass(distance.averageArrowValueDifference)">
                  {{ formatDifference(distance.averageArrowValueDifference, 1) }}
                </span>
              </span>
              <span v-else class="diff-value" :class="differenceClass(historical.distances[0].averageArrowValueDifference)">
                {{ formatDifference(historical.distances[0].averageArrowValueDifference, 1) }}
              </span>
            </div>

            <div class="table-row">
              <span class="metric-label">Distance total</span>
              <span v-if="historical.distances.length > 1" class="distance-values">
                <span v-for="(distance, distIndex) in historical.distances" :key="`total-${distIndex}`" 
                      class="diff-value" :class="differenceClass(distance.distanceTotalDifference)">
                  {{ formatDifference(distance.distanceTotalDifference) }}
                </span>
              </span>
              <span v-else class="diff-value" :class="differenceClass(historical.distances[0].distanceTotalDifference)">
                {{ formatDifference(historical.distances[0].distanceTotalDifference) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue'
import HistoryCard from '@/components/HistoryCard.vue'
import { useHistoryStore } from '@/stores/history'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  comparison: {
    type: Object,
    default: null
  }
})

const historyStore = useHistoryStore()
const router = useRouter()

// Get full shoot data for each historical comparison
const fullHistoricalShoots = computed(() => {
  if (!props.comparison?.historicalComparisons) return []
  
  return props.comparison.historicalComparisons.map(historical => ({
    ...historical,
    fullShoot: historyStore.getById(historical.shoot.id)
  })).filter(item => item.fullShoot) // Only include shoots that were found
})

function navigateToShoot(shootId) {
  router.push(`/history/${shootId}`)
}

function differenceClass(difference) {
  if (difference > 0) return 'positive'
  if (difference < 0) return 'negative'
  return 'neutral'
}

function formatDifference(difference, decimals = 0) {
  const value = decimals > 0 ? difference.toFixed(decimals) : Math.round(difference)
  if (difference > 0) return `+${value}`
  return value.toString()
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  // Fallback to simple date format
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
</script>

<style scoped>
.historical-comparison {
  margin-bottom: 1rem;
}


.historical-shoots-section h4 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
}

/* Historical Comparisons */
.shoot-comparisons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.shoot-comparison {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


/* Comparison Table */
.comparison-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  align-items: center;
  padding: 0.75rem;
  gap: 1rem;
}

.table-header {
  background-color: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.table-row {
  border-bottom: 1px solid var(--color-border);
}

.table-row:last-child {
  border-bottom: none;
}

.metric-label {
  color: var(--color-text);
  font-weight: 500;
}

/* Single distance layout */
.shoot-comparison .table-header,
.shoot-comparison .table-row {
  grid-template-columns: 1fr auto;
}

/* Multi-distance layout - dynamic columns */
.distance-headers,
.distance-values {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.distance-header {
  font-weight: 600;
  color: var(--color-text);
  min-width: 4rem;
  text-align: center;
}

.diff-value {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 4rem;
  text-align: center;
}

.diff-value.positive {
  color: var(--color-highlight);
}

.diff-value.negative {
  color: var(--color-off-track);
}

.diff-value.neutral {
  color: var(--color-text-secondary);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .distance-stat,
  .single-distance-stats {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .shoot-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .distance-breakdown {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .distance-differences,
  .single-distance-breakdown {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .comparison-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .shoots-count {
    font-size: 0.8rem;
  }
  
  .current-total {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .distance-differences,
  .single-distance-breakdown {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>