<template>
  <div v-if="hasData">
    <!-- Show multiple distance charts for multi-distance rounds -->
    <div v-if="distanceCharts.length > 1" class="multi-distance-charts">
      <BaseCard 
        v-for="(distanceData, index) in distanceCharts" 
        :key="`distance-${index}`"
        class="distance-chart-card"
      >
        <div class="distance-chart">
          <h4 class="distance-title">{{ distanceData.title }}</h4>
          <div class="distance-subtitle">{{ distanceData.subtitle }}</div>
          
          <!-- Distance stats button -->
          <div class="distance-stats-button-container">
            <button 
              @click="navigateToDistanceStats" 
              class="distance-stats-button"
              type="button"
            >
              View Distance Stats
            </button>
          </div>
          
          <!-- Chart view -->
          <div v-if="!distanceLegendToggles.get(index)" class="chart-container">
            <div class="chart-wrapper" @click="toggleDistanceView(index)">
              <canvas :ref="el => distanceCanvases[index] = el"></canvas>
            </div>
            <div v-if="distanceData.distribution.length > 0" class="chart-toggle-hint">
              Tap chart to view score details
            </div>
          </div>
          
          <!-- Legend table view -->
          <div v-else class="legend-table-view" @click="toggleDistanceView(index)">
            <div v-if="distanceData.distribution.length > 0" class="custom-legend">
              <div class="legend-items">
                <div 
                  v-for="item in distanceData.distribution" 
                  :key="item.score"
                  class="legend-item"
                >
                  <div 
                    class="legend-color" 
                    :style="{ 
                      backgroundColor: item.color.backgroundColor,
                      borderColor: item.color.borderColor,
                    }"
                  ></div>
                  <span class="legend-text">{{ item.score }}</span>
                  <span class="legend-count">{{ item.count }}</span>
                  <span class="legend-percentage">({{ (item.percentage || 0).toFixed(1) }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- Show single chart for single-distance rounds -->
    <BaseCard v-else class="single-distance-chart-card">
      <div class="single-distance-chart">
        <h4 v-if="distanceCharts.length > 0 && distanceCharts[0].title" class="distance-title">{{ distanceCharts[0].title }}</h4>
        <div v-if="distanceCharts.length > 0 && distanceCharts[0].subtitle" class="distance-subtitle">{{ distanceCharts[0].subtitle }}</div>
        
        <!-- Distance stats button -->
        <div class="distance-stats-button-container">
          <button 
            @click="navigateToDistanceStats" 
            class="distance-stats-button"
            type="button"
          >
            View Distance Stats
          </button>
        </div>
        
        <!-- Chart view -->
        <div v-if="!showLegendTable" class="chart-container">
          <div class="chart-wrapper" @click="toggleView">
            <canvas ref="chartCanvas"></canvas>
          </div>
          <div v-if="singleChartLegend.length > 0" class="chart-toggle-hint">
            Tap chart to view score details
          </div>
        </div>
        
        <!-- Legend table view -->
        <div v-else class="legend-table-view" @click="toggleView">
          <div class="legend-table-header">
            <div class="legend-title">Score Distribution</div>
            <div class="back-to-chart-hint">Tap anywhere to return to chart</div>
          </div>
          <div v-if="singleChartLegend.length > 0" class="custom-legend">
            <div class="legend-items">
              <div 
                v-for="legendItem in singleChartLegend" 
                :key="legendItem.score"
                class="legend-item"
              >
                <div 
                  class="legend-color" 
                  :style="{ 
                    backgroundColor: legendItem.backgroundColor,
                  }"
                ></div>
                <span class="legend-text">{{ legendItem.score }}</span>
                <span class="legend-count">{{ legendItem.count }}</span>
                <span class="legend-percentage">({{ legendItem.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
  <div v-else class="no-data-container">
    <p class="no-data-message">No score data available for distribution chart.</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Chart,
  PieController,
  ArcElement,
  Legend
} from 'chart.js';

const router = useRouter()

// Chart.js components are now registered globally in createApp.ts
// No need to register them here
import { gameTypeConfig } from "@/domain/scoring/game_types"
import { calculateDistanceTotals, calculateAverageArrowScorePerDistance } from "@/domain/scoring/distance_totals"
import BaseCard from "@/components/BaseCard.vue"

const props = defineProps({
  scores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    required: true
  }
})

const chartCanvas = ref(null)
const distanceCanvases = ref([])
const chart = ref(null)
const distanceCharts = ref([])
const distanceChartInstances = ref([])
const isUpdating = ref(false)
const showLegendTable = ref(false)
const distanceLegendToggles = ref(new Map())

// Get the score color mapping from CSS classes
const getScoreColor = (score, gameType) => {
  // Handle Worcester rounds specifically
  if (gameType.toLowerCase().includes('worcester')) {
    if (score === 5 || score === 'X') {
      return { backgroundColor: '#fff', borderColor: '#000' } // worcester5 - white background, black text
    } else {
      return { backgroundColor: '#000', borderColor: '#fff' } // worcesterRest - black background, white text
    }
  }
  
  // Handle special cases for regular rounds first
  if (score === 'X') return { backgroundColor: '#fefc2a', borderColor: '#000' } // Gold - brightest
  if (score === 'M' || score === 0) return { backgroundColor: 'darkgreen', borderColor: '#fff' }
  
  // Handle numeric scores for regular rounds
  const numScore = parseInt(score)
  if (isNaN(numScore)) return { backgroundColor: 'darkgreen', borderColor: '#fff' } // Fallback for non-numeric
  
  if (numScore === 10) return { backgroundColor: '#f5f02a', borderColor: '#000' } // Gold - slightly darker
  if (numScore === 9) return { backgroundColor: '#e8e32a', borderColor: '#000' } // Gold - darker
  if (numScore === 8) return { backgroundColor: '#fc2e2a', borderColor: '#fff' } // Red - brighter
  if (numScore === 7) return { backgroundColor: '#e02a2a', borderColor: '#fff' } // Red - darker
  if (numScore === 6) return { backgroundColor: '#2790f9', borderColor: '#fff' } // Blue - brighter
  if (numScore === 5) return { backgroundColor: '#1f7ae0', borderColor: '#fff' } // Blue - darker
  if (numScore === 4) return { backgroundColor: '#000', borderColor: '#fff' } // Black - brighter
  if (numScore === 3) return { backgroundColor: '#1a1a1a', borderColor: '#fff' } // Black - darker
  if (numScore === 2) return { backgroundColor: '#fff', borderColor: '#000' } // White - brighter
  if (numScore === 1) return { backgroundColor: '#f0f0f0', borderColor: '#000' } // White - slightly gray
  
  return { backgroundColor: 'darkgreen', borderColor: '#fff' } // Miss fallback
}

// Calculate score distribution for a given set of scores
const calculateScoreDistribution = (scores, gameType) => {
  if (!scores || scores.length === 0) return []
  
  // Get valid scores for this game type
  const config = gameTypeConfig[gameType]
  const validScores = config?.scores || []
  
  // Count occurrences of each score
  const scoreCounts = {}
  
  // Initialize counts for all valid scores
  validScores.forEach(score => {
    scoreCounts[score] = 0
  })
  
  // Count actual scores in the data
  scores.forEach(score => {
    if (score !== null && score !== undefined) {
      // Convert 'MISS' to 'M' for consistency
      const normalizedScore = score === 'MISS' ? 'M' : score
      if (scoreCounts.hasOwnProperty(normalizedScore)) {
        scoreCounts[normalizedScore]++
      }
    }
  })
  
  // Convert to array and filter out zero counts
  return Object.entries(scoreCounts)
    .filter(([score, count]) => count > 0)
    .map(([score, count]) => ({
      score,
      count,
      percentage: (count / scores.length * 100),
      color: getScoreColor(score, gameType)
    }))
    .sort((a, b) => {
      // Sort by score value, with special handling for X and M
      if (a.score === 'X') return -1
      if (b.score === 'X') return 1
      if (a.score === 'M') return 1
      if (b.score === 'M') return -1
      return parseInt(b.score) - parseInt(a.score)
    })
}

// Calculate average arrow scores per distance
const averageArrowScores = computed(() => {
  if (!props.scores || props.scores.length === 0) return []
  
  const config = gameTypeConfig[props.gameType]
  const endSize = config?.endSize || 6
  
  return calculateAverageArrowScorePerDistance(props.scores, props.gameType, endSize)
})

// Calculate distance-specific chart data
const distanceChartData = computed(() => {
  if (!props.scores || props.scores.length === 0) return []
  
  const config = gameTypeConfig[props.gameType]
  const endSize = config?.endSize || 6
  
  // Use calculateDistanceTotals to split scores by distance
  const distanceTotals = calculateDistanceTotals(props.scores, props.gameType, endSize)
  const averageScores = averageArrowScores.value
  
  if (distanceTotals.length <= 1) {
    // Single distance - use all scores
    const distribution = calculateScoreDistribution(props.scores, props.gameType)
    const averageScore = averageScores.length > 0 ? averageScores[0].averageArrowScore : 0
    return distribution.length > 0 ? [{
      title: 'Score Distribution',
      subtitle: `Average score of ${averageScore} per arrow`,
      distribution,
      hasData: true
    }] : []
  }
  
  // Multiple distances - create chart for each distance
  return distanceTotals.map((distanceData, index) => {
    // Extract scores from the round breakdown
    const distanceScores = []
    distanceData.roundBreakdown.forEach(endPair => {
      distanceScores.push(...endPair.firstEnd, ...endPair.secondEnd)
    })
    
    const distribution = calculateScoreDistribution(distanceScores, props.gameType)
    const title = `${distanceData.distance}${distanceData.unit}`
    const averageScore = averageScores[index]?.averageArrowScore || 0
    const subtitle = `Average score of ${averageScore} per arrow`
    
    return {
      title,
      subtitle,
      distribution,
      hasData: distribution.length > 0
    }
  }).filter(chart => chart.hasData)
})

// Legacy single chart distribution for backwards compatibility
const scoreDistribution = computed(() => {
  return calculateScoreDistribution(props.scores, props.gameType)
})

// Create legend data for single chart
const singleChartLegend = computed(() => {
  if (distanceCharts.value.length > 1) return []
  
  const distribution = distanceCharts.value[0]?.distribution || scoreDistribution.value
  return distribution.map(item => ({
    score: item.score,
    count: item.count,
    percentage: item.percentage.toFixed(1),
    backgroundColor: item.color.backgroundColor,
    borderColor: item.color.borderColor
  })).sort((a, b) => {
    // Sort by score value, with special handling for X and M
    if (a.score === 'X') return -1
    if (b.score === 'X') return 1
    if (a.score === 'M') return 1
    if (b.score === 'M') return -1
    return parseInt(b.score) - parseInt(a.score)
  })
})

// Update distanceCharts ref when computed value changes
watch(distanceChartData, (newChartData) => {
  distanceCharts.value = newChartData
}, { immediate: true })


// Check if we have meaningful data to display
const hasData = computed(() => {
  return distanceChartData.value.length > 0
})

// Create chart data for a given distribution
const createChartData = (distribution) => {
  return {
    labels: distribution.map(item => item.score),
    datasets: [{
      data: distribution.map(item => item.count || 0),
      backgroundColor: distribution.map(item => item.color.backgroundColor),
      borderColor: '#000000', // Use consistent black border for all slices
      borderWidth: 2,
      hidden: false,
      clip: false,
      disabled: false
    }]
  }
}

// Chart options
const getChartOptions = (distribution, hideIndividualLegend = false) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    plugins: {
      legend: {
        display: false // Always hide Chart.js legend, we use custom HTML legends
      },
      tooltip: {
        enabled: false // Disable tooltips entirely - we have custom HTML legends instead
      },
      filler: {
        propagate: false // Disable filler plugin - pie charts don't use fill
      }
    },
    // Disable all interactions to prevent tooltip and event handling issues
    interaction: {
      intersect: false,
      mode: false // Disable interaction mode entirely
    },
    // Disable hover events
    hover: {
      mode: null
    },
    // Add animation config to prevent issues during transitions
    animation: {
      duration: 300
    },
    // Disable all event handling
    events: [] // Empty array disables all Chart.js event processing
  }
}

// Create or update charts for multiple distances
const updateDistanceCharts = async () => {
  if (!hasData.value || distanceCharts.value.length <= 1) return

  // Destroy existing distance charts
  distanceChartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  distanceChartInstances.value = []

  // Destroy single chart if it exists
  if (chart.value) {
    chart.value.destroy()
    chart.value = null
  }

  await nextTick()

  // Create a chart for each distance
  distanceCharts.value.forEach(async (distanceData, index) => {
    const canvas = distanceCanvases.value[index]
    if (!canvas || !distanceData.hasData) return

    try {
      const ctx = canvas.getContext('2d')
      const chartData = createChartData(distanceData.distribution)
      const options = getChartOptions(distanceData.distribution, true) // Hide individual legends
      
      const chartInstance = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: options,
        plugins: [Legend] // Register Legend plugin per-chart to avoid global interference
      })
      
      distanceChartInstances.value[index] = chartInstance
    } catch (error) {
      console.error(`Distance chart ${index} creation failed:`, error)
    }
  })
}

// Create or update the single chart
const updateSingleChart = async () => {
  if (!chartCanvas.value || !hasData.value || distanceCharts.value.length > 1) return

  // Destroy existing distance charts
  distanceChartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  distanceChartInstances.value = []

  if (chart.value) {
    chart.value.destroy()
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  const distribution = distanceCharts.value[0]?.distribution || scoreDistribution.value
  
  try {
    chart.value = new Chart(ctx, {
      type: 'pie',
      data: createChartData(distribution),
      options: getChartOptions(distribution, false), // Show legend for single charts
      plugins: [Legend] // Register Legend plugin per-chart to avoid global interference
    })
  } catch (error) {
    console.error('Score distribution chart creation failed:', error)
  }
}

// Main update function
const updateCharts = async () => {
  if (!hasData.value || isUpdating.value) return
  
  isUpdating.value = true
  try {
    if (distanceCharts.value.length > 1) {
      await updateDistanceCharts()
    } else {
      await updateSingleChart()
    }
  } finally {
    isUpdating.value = false
  }
}

// Toggle between chart and legend table
const toggleView = async () => {
  showLegendTable.value = !showLegendTable.value
  
  // If switching back to chart view, recreate the chart after DOM update
  if (!showLegendTable.value) {
    await nextTick()
    updateCharts()
  }
}

// Toggle individual distance chart view
const toggleDistanceView = async (index) => {
  const current = distanceLegendToggles.value.get(index) || false
  distanceLegendToggles.value.set(index, !current)
  
  // If switching back to chart view (current was true, now false), recreate the chart after DOM update
  if (current) {
    await nextTick()
    updateCharts()
  }
}

// Navigate to distance performance page
const navigateToDistanceStats = () => {
  router.push('/distance-performance')
}

// Handle window resize
const handleResize = () => {
  if (chart.value) {
    chart.value.resize()
  }
  distanceChartInstances.value.forEach(chart => {
    if (chart) chart.resize()
  })
}

// Watch for data changes
watch(() => [props.scores, props.gameType], () => {
  if (hasData.value) {
    updateCharts()
  }
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  if (hasData.value) {
    updateCharts()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
    chart.value = null
  }
  distanceChartInstances.value.forEach(chart => {
    if (chart) chart.destroy()
  })
  distanceChartInstances.value = []
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.no-data-container {
  text-align: center;
  padding: 2rem 1rem;
  margin: 1rem 0;
  background-color: var(--color-background-soft);
  border-radius: 8px;
}

/* Removed shared-legend styles - now using custom legends only */

.custom-legend {
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--color-background-mute, rgba(255, 255, 255, 0.05));
  border-radius: 6px;
}

.legend-table-view .custom-legend {
  margin-top: 0;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
}

.custom-legend .legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.custom-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.custom-legend .legend-color {
  width: 1.5em;
  height: 1.5em;
  border-style: none;
  border-width: 0;
  border-radius: 50%;
  flex-shrink: 0;
}

.custom-legend .legend-text {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}

.legend-count {
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 500;
  min-width: 3rem;
}

.legend-percentage {
  font-size: 0.9rem;
  color: var(--color-text-light, #666);
  font-style: italic;
}

.multi-distance-charts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distance-chart-card,
.single-distance-chart-card {
  margin-bottom: 0;
}

.distance-chart,
.single-distance-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.distance-title {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.distance-subtitle {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary, #666);
  font-size: 0.9rem;
  font-weight: 400;
  text-align: center;
  font-style: italic;
}

.distance-stats-button-container {
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.distance-stats-button {
  padding: 0.6rem 1.2rem;
  background-color: var(--color-highlight);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.distance-stats-button:hover {
  background-color: var(--color-highlight);
  opacity: 0.9;
  transform: translateY(-1px);
}

.distance-stats-button:active {
  transform: translateY(0);
}

.distance-chart .chart-wrapper,
.single-distance-chart .chart-wrapper {
  height: 400px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.distance-chart .chart-wrapper:hover,
.single-distance-chart .chart-wrapper:hover {
  opacity: 0.9;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-toggle-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-light, #666);
  text-align: center;
  font-style: italic;
}

.legend-table-view {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 8px;
  background-color: var(--color-background-soft);
  transition: all 0.2s ease;
  padding: 0.5rem;

}

.legend-table-view:hover {
  border-color: var(--color-border, rgba(255, 255, 255, 0.3));
  background-color: var(--color-background-mute, rgba(255, 255, 255, 0.1));
}

.legend-table-header {
  padding: 0.5rem;
  text-align: center;
  border-radius: 6px;
  background-color: var(--color-background-mute, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
  margin-bottom: 1rem;
}

.back-to-chart-hint {
  font-size: 0.75rem;
  color: var(--color-text-light, #666);
  font-style: italic;
  margin-top: 0.25rem;
}

.no-data-message {
  color: var(--color-text-light, #666);
  font-style: italic;
  margin: 0;
}

@media (max-width: 768px) {
  .custom-legend {
    margin-top: 0.75rem;
    padding: 0.75rem;
  }
  
  .custom-legend .legend-text {
    font-size: 0.9rem;
  }
  
  .legend-count {
    font-size: 0.85rem;
  }
  
  .legend-percentage {
    font-size: 0.8rem;
  }
  
  .multi-distance-charts {
    gap: 1rem;
  }
  
  .distance-chart .chart-wrapper,
  .single-distance-chart .chart-wrapper {
    height: 350px;
    max-width: 600px;
  }
  
  .chart-toggle-hint {
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }
  
  .back-to-chart-hint {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .score-distribution-container {
    margin: 0.5rem 0;
    padding: 0.75rem;
  }
  
  .custom-legend {
    margin-top: 0.5rem;
    padding: 0.5rem;
  }
  
  .custom-legend .legend-item {
    gap: 0.5rem;
  }
  
  .custom-legend .legend-text {
    font-size: 0.85rem;
    min-width: 1.5rem;
  }
  
  .legend-count {
    font-size: 0.8rem;
    min-width: 2.5rem;
  }
  
  .legend-percentage {
    font-size: 0.75rem;
  }
  
  .multi-distance-charts {
    gap: 1rem;
  }
  
  .distance-chart .chart-wrapper,
  .single-distance-chart .chart-wrapper {
    height: 300px;
    max-width: 100%;
  }
  
  .distance-title {
    font-size: 1rem;
  }
  
  .chart-toggle-hint {
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  
  .back-to-chart-hint {
    font-size: 0.75rem;
  }
}
</style>
