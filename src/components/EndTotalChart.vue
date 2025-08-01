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
import Chart from 'chart.js/auto'
import annotationPlugin from 'chartjs-plugin-annotation'
import { splitIntoChunks } from "@shared/utils/splitter"
import { convertToValues } from "@shared/utils/scores"
import { calculateTotal } from "@shared/utils/subtotals"
import { gameTypeConfig } from "@/domain/scoring/game_types"

// Register the annotation plugin
Chart.register(annotationPlugin)

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
const chart = ref(null)

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

// Chart data
const chartData = computed(() => {
  if (!hasData.value) return { labels: [], datasets: [] }
  
  const completeEnds = endTotals.value.filter(end => end.isComplete)
  
  return {
    labels: completeEnds.map(end => `End ${end.endNumber}`),
    datasets: [{
      label: 'End Total',
      data: completeEnds.map(end => end.total),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  }
})

// Chart options
const chartOptions = computed(() => {
  if (!hasData.value) return {}
  
  const allTotals = endTotals.value.filter(end => end.isComplete).map(end => end.total)
  const minTotal = Math.min(...allTotals)
  const maxTotal = Math.max(...allTotals)
  
  // Add some padding to the Y-axis
  const padding = Math.max(1, Math.ceil((maxTotal - minTotal) * 0.1))
  const yMin = Math.max(0, minTotal - padding)
  const yMax = maxTotal + padding
  
  // Create distance change annotations
  const completeEnds = endTotals.value.filter(end => end.isComplete)
  const distanceChangeAnnotations = {}
  
  // Add label for the first distance (at the start of the chart)
  if (completeEnds.length > 0 && completeEnds[0].distance) {
    distanceChangeAnnotations['firstDistance'] = {
      type: 'line',
      xMin: 0,
      xMax: 0,
      borderColor: 'rgba(75, 192, 192, 0.6)',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        display: true,
        content: `${completeEnds[0].distance}${completeEnds[0].distanceUnit}`,
        enabled: true,
        position: 'top',
        backgroundColor: 'rgba(75, 192, 192, 0.9)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
        color: 'white',
        font: {
          size: 11,
          weight: 'bold'
        },
        padding: {
          x: 6,
          y: 4
        },
        yAdjust: -10
      }
    }
  }
  
  // Add labels for distance changes
  completeEnds.forEach((end, index) => {
    if (end.isDistanceChange) {
      distanceChangeAnnotations[`distanceChange${index}`] = {
        type: 'line',
        xMin: index,
        xMax: index,
        borderColor: 'rgba(255, 99, 132, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        label: {
          display: true,
          content: `${end.distance}${end.distanceUnit}`,
          enabled: true,
          position: 'top',
          backgroundColor: 'rgba(255, 99, 132, 0.9)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderRadius: 4,
          color: 'white',
          font: {
            size: 11,
            weight: 'bold'
          },
          padding: {
            x: 6,
            y: 4
          },
          yAdjust: -10
        }
      }
    }
  })
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false // Hide legend since we only have one dataset
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
      },
      annotation: {
        annotations: distanceChangeAnnotations
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--color-text)',
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
          color: 'var(--color-text)',
          font: {
            size: 12
          },
          stepSize: 1
        },
        title: {
          display: true,
          text: 'End Total',
          color: 'var(--color-text)',
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
  if (!chartCanvas.value || !hasData.value) return

  if (chart.value) {
    chart.value.destroy()
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  
  try {
    chart.value = new Chart(ctx, {
      type: 'line',
      data: chartData.value,
      options: chartOptions.value
    })
  } catch (error) {
    console.error('End Total chart creation failed:', error)
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
  if (chart.value) {
    chart.value.destroy()
  }
  window.removeEventListener('resize', handleResize)
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
  height: 250px;
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
    height: 200px;
  }
}
</style>
