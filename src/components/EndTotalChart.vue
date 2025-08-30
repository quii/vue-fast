<template>
  <div v-if="hasData" class="et-chart-container">
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
  <div v-else-if="endTotals.length === 1" class="et-chart-container no-data">
    <p class="no-data-message">Complete at least 2 ends to see the End Total progression chart.</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
} from 'chart.js';

// Chart.js components are now registered globally in createApp.ts
// No need to register them here
import { splitIntoChunks } from "@shared/utils/splitter"
import { convertToValues } from "@shared/utils/scores"
import { calculateTotal } from "@shared/utils/subtotals"
import { gameTypeConfig } from "@/domain/scoring/game_types"

const props = defineProps({
  scores: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    required: true
  },
  historicalShoots: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
const chart = ref(null)
const isUpdating = ref(false)

// Determine end size based on game type
const endSize = computed(() => {
  return props.gameType.toLowerCase().includes('worcester') ? 5 : 6
})

// Calculate end totals from scores and determine distance information
const endTotals = computed(() => {
  if (!props.scores || props.scores.length === 0) return []
  
  const scoreValues = convertToValues(props.scores, props.gameType)
  const ends = splitIntoChunks(scoreValues, endSize.value)
  
  // Get distance information for this game type
  const config = gameTypeConfig[props.gameType]
  const distanceInfo = calculateDistanceInfo(config, ends.length, endSize.value)
  
  return ends.map((end, index) => ({
    endNumber: index + 1,
    total: calculateTotal(end),
    isComplete: end.length === endSize.value,
    distance: distanceInfo.endDistances[index],
    distanceUnit: distanceInfo.unit,
    isDistanceChange: distanceInfo.distanceChanges[index] || false
  }))
})

// Helper function to calculate which distance each end belongs to
const calculateDistanceInfo = (config, totalEnds, endSize) => {
  const { distancesRoundSizes } = config
  
  // Determine if this is a practice round
  const isPracticeRound = !distancesRoundSizes ||
    (distancesRoundSizes.length === 1 && distancesRoundSizes[0] === 100)
  
  if (isPracticeRound) {
    // For practice rounds, all ends are at the same distance
    const distance = config.isImperial ? config.maxDistanceYards : config.maxDistanceMetres
    const unit = config.isImperial ? 'yd' : 'm'
    
    return {
      endDistances: Array(totalEnds).fill(distance),
      unit,
      distanceChanges: Array(totalEnds).fill(false)
    }
  }
  
  // For standard rounds, calculate distance changes
  const distances = []
  const unit = config.isImperial ? 'yd' : 'm'
  
  if (config.isImperial) {
    if (config.maxDistanceYards) distances.push(config.maxDistanceYards)
    if (config.otherDistancesYards) distances.push(...config.otherDistancesYards)
  } else {
    if (config.maxDistanceMetres) distances.push(config.maxDistanceMetres)
    if (config.otherDistancesMetres) distances.push(...config.otherDistancesMetres)
  }
  
  // Map each end to its distance
  const endDistances = []
  const distanceChanges = []
  let currentEndIndex = 0
  
  for (let distanceIndex = 0; distanceIndex < distancesRoundSizes.length; distanceIndex++) {
    const dozens = distancesRoundSizes[distanceIndex]
    const arrowsForThisDistance = Math.round(dozens * 12)
    const endsForThisDistance = Math.ceil(arrowsForThisDistance / endSize)
    
    for (let i = 0; i < endsForThisDistance && currentEndIndex < totalEnds; i++) {
      endDistances[currentEndIndex] = distances[distanceIndex] || null
      // Mark the first end of each new distance (except the very first end)
      distanceChanges[currentEndIndex] = distanceIndex > 0 && i === 0
      currentEndIndex++
    }
  }
  
  return {
    endDistances,
    unit,
    distanceChanges
  }
}

// Check if we have meaningful data to display
const hasData = computed(() => {
  return endTotals.value.length > 1 // Need at least 2 ends to show a meaningful graph
})

// Chart data - BACK TO ORIGINAL WORKING VERSION
const chartData = computed(() => {
  if (!hasData.value) return { 
    labels: [], 
    datasets: [{
      label: 'No Data',
      data: []
    }] 
  }
  
  const completeEnds = endTotals.value.filter(end => end.isComplete)
  
  const datasets = [{
    label: 'Current Shoot',
    data: completeEnds.map(end => end.total || 0),
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 4,
    fill: false,
    tension: 0.4,
    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 6,
    pointHoverRadius: 8
  }]
  
  // Add multiple historical shoots
  if (props.historicalShoots && props.historicalShoots.length > 0 && completeEnds.length > 0) {
    const colors = [
      'rgba(156, 163, 175, 0.8)', // Gray
      'rgba(107, 114, 128, 0.8)', // Darker gray
      'rgba(75, 85, 99, 0.8)',    // Even darker gray
    ]
    
    props.historicalShoots.forEach((shoot, index) => {
      if (shoot && shoot.scores && Array.isArray(shoot.scores)) {
        try {
          // Calculate end totals for this historical shoot
          const scoreValues = convertToValues(shoot.scores, props.gameType)
          const ends = splitIntoChunks(scoreValues, endSize.value)
          
          // Create data array with EXACTLY the same length as current shoot
          const historicalData = []
          for (let i = 0; i < completeEnds.length; i++) {
            if (ends[i] && ends[i].length === endSize.value) {
              const total = calculateTotal(ends[i])
              historicalData.push(typeof total === 'number' && !isNaN(total) ? total : 0)
            } else {
              historicalData.push(0) // Fill missing data with 0
            }
          }
          
          // Only add if array length matches exactly
          if (historicalData.length === completeEnds.length) {
            const color = colors[index % colors.length]
            const date = new Date(shoot.date)
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`
            
            datasets.push({
              label: formattedDate,
              data: historicalData,
              backgroundColor: color.replace('0.8', '0.1'),
              borderColor: color,
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              pointBackgroundColor: color,
              pointBorderColor: '#fff',
              pointBorderWidth: 1,
              pointRadius: 3,
              pointHoverRadius: 5
            })
          }
        } catch (error) {
          console.warn('Error processing historical shoot data:', error)
          // Don't add the dataset if there's an error
        }
      }
    })
  }
  
  return {
    labels: completeEnds.map(end => `End ${end.endNumber}`),
    datasets
  }
})

// Chart options
const chartOptions = computed(() => {
  if (!hasData.value) return {}
  
  // Collect ALL totals from both current and historical data for Y-axis scaling
  const allTotals = endTotals.value.filter(end => end.isComplete).map(end => end.total)
  
  // Add historical data totals to the mix for proper Y-axis scaling
  if (props.historicalShoots && props.historicalShoots.length > 0) {
    const completeEnds = endTotals.value.filter(end => end.isComplete)
    
    props.historicalShoots.forEach(shoot => {
      if (shoot && shoot.scores && Array.isArray(shoot.scores)) {
        try {
          const scoreValues = convertToValues(shoot.scores, props.gameType)
          const ends = splitIntoChunks(scoreValues, endSize.value)
          
          ends.forEach((end, index) => {
            if (end.length === endSize.value && index < completeEnds.length) {
              const total = calculateTotal(end)
              if (typeof total === 'number' && !isNaN(total)) {
                allTotals.push(total)
              }
            }
          })
        } catch (error) {
          // Ignore errors for Y-axis calculation
        }
      }
    })
  }
  
  const minTotal = Math.min(...allTotals)
  const maxTotal = Math.max(...allTotals)
  
  // Add some padding to the Y-axis
  const padding = Math.max(1, Math.ceil((maxTotal - minTotal) * 0.1))
  const yMin = Math.max(0, minTotal - padding)
  const yMax = maxTotal + padding
  
  // Get computed CSS variables for dark mode support
  const rootStyle = getComputedStyle(document.documentElement)
  const textColor = rootStyle.getPropertyValue('--color-text').trim()
  
  // Get filtered end data for tooltip callbacks
  const completeEnds = endTotals.value.filter(end => end.isComplete)
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: props.historicalShoots && props.historicalShoots.length > 0,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: textColor,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            const endIndex = context.dataIndex
            const end = completeEnds[endIndex]
            const distance = end.distance ? ` (${end.distance}${end.distanceUnit})` : ''
            return `Total: ${context.parsed.y}${distance}`
          }
        }
      }
      // Distance change annotations are now handled in the afterDraw plugin
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          font: {
            size: 12
          }
        }
      },
      y: {
        min: yMin,
        max: yMax,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: textColor,
          font: {
            size: 12
          },
          stepSize: Math.max(1, Math.ceil((yMax - yMin) / 10)) // Adaptive step size for better spacing
        },
        title: {
          display: true,
          text: 'End Total',
          color: textColor,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  }
})

// Create or update the chart
const updateChart = async () => {
  if (!chartCanvas.value || !hasData.value || isUpdating.value) return
  
  // Add safety check to prevent updating during component destruction
  if (!chartCanvas.value.isConnected) return

  isUpdating.value = true
  try {
    // Ensure complete cleanup before creating new chart
    if (chart.value) {
      chart.value.destroy()
      chart.value = null
    }

    await nextTick()

    const ctx = chartCanvas.value?.getContext('2d')
    if (!ctx || !chartCanvas.value.isConnected) {
      isUpdating.value = false
      return
    }
    
    // Ensure chart data is properly structured with defensive checks
    const safeChartData = chartData.value
    if (!safeChartData || !safeChartData.datasets || safeChartData.datasets.length === 0) {
      isUpdating.value = false
      return
    }
    
    // Validate dataset structure before creating chart
    const validDataset = safeChartData.datasets[0]
    if (!validDataset || !Array.isArray(validDataset.data)) {
      isUpdating.value = false
      return
    }
    
    chart.value = new Chart(ctx, {
      type: 'line',
      data: safeChartData,
      options: chartOptions.value,
      plugins: [
        // Register Legend and Tooltip plugins per-chart to avoid global interference
        Legend,
        Tooltip
      ]
    })
  } catch (error) {
    console.error('End Total chart creation failed:', error)
    // Ensure chart value is null on error
    chart.value = null
  } finally {
    isUpdating.value = false
  }
}

// Handle window resize
const handleResize = () => {
  if (chart.value) {
    chart.value.resize()
  }
}

// Watch for data changes
watch(() => [props.scores, props.gameType], () => {
  if (hasData.value) {
    updateChart()
  }
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  if (hasData.value) {
    updateChart()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // Use nextTick to ensure any pending Chart.js operations complete
  nextTick(() => {
    if (chart.value) {
      try {
        chart.value.destroy()
      } catch (error) {
        console.warn('Chart destruction failed:', error)
      } finally {
        chart.value = null
      }
    }
  })
})
</script>

<style scoped>
.et-chart-container {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 8px;
}

.et-chart-container.no-data {
  text-align: center;
  padding: 2rem 1rem;
}



.chart-wrapper {
  height: 400px; /* Increased from 250px to accommodate legend with multiple historical shoots */
  width: 100%;
  position: relative;
}

.no-data-message {
  color: var(--color-text-light, #666);
  font-style: italic;
  margin: 0;
}

@media (max-width: 480px) {
  .et-chart-container {
    margin: 0.5rem 0;
    padding: 0.75rem;
  }
  
  .chart-wrapper {
    height: 350px; /* Increased from 200px for mobile */
  }
}
</style>
