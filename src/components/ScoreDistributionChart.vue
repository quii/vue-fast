<template>
  <div v-if="hasData" class="score-distribution-container">
    <!-- Shared legend for multiple distance charts -->
    <div v-if="distanceCharts.length > 1 && sharedLegend.length > 0" class="shared-legend">
      <div class="legend-items">
        <div 
          v-for="legendItem in sharedLegend" 
          :key="legendItem.score"
          class="legend-item"
        >
          <div 
            class="legend-color" 
            :style="{ 
              backgroundColor: legendItem.backgroundColor,
              borderColor: legendItem.borderColor,
              borderWidth: '2px',
              borderStyle: 'solid'
            }"
          ></div>
          <span class="legend-text">{{ legendItem.score }}</span>
        </div>
      </div>
    </div>

    <!-- Show multiple distance charts for multi-distance rounds -->
    <div v-if="distanceCharts.length > 1" class="multi-distance-charts">
      <div 
        v-for="(distanceData, index) in distanceCharts" 
        :key="`distance-${index}`"
        class="distance-chart"
      >
        <h4 class="distance-title">{{ distanceData.title }}</h4>
        <div class="chart-wrapper">
          <canvas :ref="el => distanceCanvases[index] = el"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Show single chart for single-distance rounds -->
    <div v-else class="single-distance-chart">
      <div class="chart-wrapper">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
  <div v-else class="score-distribution-container no-data">
    <p class="no-data-message">No score data available for distribution chart.</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { gameTypeConfig } from "@/domain/scoring/game_types"
import { calculateDistanceTotals } from "@/domain/scoring/distance_totals"

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

// Calculate distance-specific chart data
const distanceChartData = computed(() => {
  if (!props.scores || props.scores.length === 0) return []
  
  const config = gameTypeConfig[props.gameType]
  const endSize = config?.endSize || 6
  
  // Use calculateDistanceTotals to split scores by distance
  const distanceTotals = calculateDistanceTotals(props.scores, props.gameType, endSize)
  
  if (distanceTotals.length <= 1) {
    // Single distance - use all scores
    const distribution = calculateScoreDistribution(props.scores, props.gameType)
    return distribution.length > 0 ? [{
      title: 'Score Distribution',
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
    
    return {
      title,
      distribution,
      hasData: distribution.length > 0
    }
  }).filter(chart => chart.hasData)
})

// Legacy single chart distribution for backwards compatibility
const scoreDistribution = computed(() => {
  return calculateScoreDistribution(props.scores, props.gameType)
})

// Update distanceCharts ref when computed value changes
watch(distanceChartData, (newChartData) => {
  distanceCharts.value = newChartData
}, { immediate: true })

// Create shared legend for multiple distance charts
const sharedLegend = computed(() => {
  if (distanceCharts.value.length <= 1) return []
  
  // Get all unique scores across all distance charts
  const allScores = new Set()
  distanceCharts.value.forEach(chart => {
    chart.distribution.forEach(item => {
      allScores.add(item.score)
    })
  })
  
  // Convert to sorted array with color information
  return Array.from(allScores)
    .map(score => {
      const color = getScoreColor(score, props.gameType)
      return {
        score,
        backgroundColor: color.backgroundColor,
        borderColor: color.borderColor
      }
    })
    .sort((a, b) => {
      // Sort by score value, with special handling for X and M
      if (a.score === 'X') return -1
      if (b.score === 'X') return 1
      if (a.score === 'M') return 1
      if (b.score === 'M') return -1
      return parseInt(b.score) - parseInt(a.score)
    })
})

// Check if we have meaningful data to display
const hasData = computed(() => {
  return distanceChartData.value.length > 0
})

// Create chart data for a given distribution
const createChartData = (distribution) => {
  return {
    labels: distribution.map(item => item.score),
    datasets: [{
      data: distribution.map(item => item.count),
      backgroundColor: distribution.map(item => item.color.backgroundColor),
      borderColor: distribution.map(item => item.color.borderColor),
      borderWidth: 2
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
        display: !hideIndividualLegend, // Hide individual legends when we have a shared legend
        position: 'right',
        labels: {
          usePointStyle: true,
          font: {
            size: 14
          },
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0]
                
                return {
                  text: label, // Just the score, no counts or percentages
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const score = context.label
            const count = context.parsed
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
            const percentage = ((count / total) * 100).toFixed(1)
            return `${score}: ${percentage}%`
          }
        }
      },
      datalabels: {
        display: false // Remove labels from inside the pie slices
      }
    }
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
        plugins: [ChartDataLabels] // Instance-specific plugin registration
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
      plugins: [ChartDataLabels] // Instance-specific plugin registration
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
.score-distribution-container {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 8px;
}

.score-distribution-container.no-data {
  text-align: center;
  padding: 2rem 1rem;
}

.shared-legend {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--color-background-mute, rgba(255, 255, 255, 0.05));
  border-radius: 6px;
  border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-text {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.multi-distance-charts {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.distance-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.distance-title {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.single-distance-chart .chart-wrapper,
.distance-chart .chart-wrapper {
  height: 400px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.no-data-message {
  color: var(--color-text-light, #666);
  font-style: italic;
  margin: 0;
}

@media (max-width: 768px) {
  .shared-legend {
    margin-bottom: 1rem;
    padding: 0.75rem;
  }
  
  .legend-items {
    gap: 0.75rem;
  }
  
  .legend-text {
    font-size: 0.85rem;
  }
  
  .multi-distance-charts {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .single-distance-chart .chart-wrapper,
  .distance-chart .chart-wrapper {
    height: 350px;
    max-width: 600px;
  }
}

@media (max-width: 480px) {
  .score-distribution-container {
    margin: 0.5rem 0;
    padding: 0.75rem;
  }
  
  .shared-legend {
    margin-bottom: 0.75rem;
    padding: 0.5rem;
  }
  
  .legend-items {
    gap: 0.5rem;
  }
  
  .legend-text {
    font-size: 0.8rem;
  }
  
  .multi-distance-charts {
    gap: 1rem;
  }
  
  .single-distance-chart .chart-wrapper,
  .distance-chart .chart-wrapper {
    height: 300px;
    max-width: 100%;
  }
  
  .distance-title {
    font-size: 1rem;
  }
}
</style>
