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

// Chart data
const chartData = computed(() => {
  if (!hasData.value) return { 
    labels: [], 
    datasets: [{
      label: 'No Data',
      data: []
    }] 
  }
  
  const completeEnds = endTotals.value.filter(end => end.isComplete)
  
  return {
    labels: completeEnds.map(end => `End ${end.endNumber}`),
    datasets: [{
      label: 'End Total',
      data: completeEnds.map(end => end.total || 0),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: false,
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
          stepSize: 1
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
        Tooltip,
        {
        id: 'distanceAnnotations',
        afterDraw: (chart) => {
          if (!chart || !chart.ctx || !chart.chartArea) return
          
          const ctx = chart.ctx
          const chartArea = chart.chartArea
          
          // Get distance changes from the current computed values
          const currentDistanceChanges = []
          const currentCompleteEnds = endTotals.value.filter(end => end.isComplete)
          
          // Add first distance at start of chart
          if (currentCompleteEnds.length > 0 && currentCompleteEnds[0].distance) {
            currentDistanceChanges.push({
              endIndex: 0,
              distance: currentCompleteEnds[0].distance,
              distanceUnit: currentCompleteEnds[0].distanceUnit,
              color: 'rgba(75, 192, 192, 0.8)',
              isFirstDistance: true
            })
          }
          
          // Add distance changes
          currentCompleteEnds.forEach((end, index) => {
            if (end.isDistanceChange) {
              currentDistanceChanges.push({
                endIndex: index,
                distance: end.distance,
                distanceUnit: end.distanceUnit,
                color: 'rgba(255, 99, 132, 0.8)',
                isFirstDistance: false
              })
            }
          })
          
          // Draw distance change lines and labels
          currentDistanceChanges.forEach(change => {
            const x = chart.scales.x.getPixelForValue(change.endIndex)
            
            // Set up line style
            ctx.save()
            ctx.strokeStyle = change.color
            ctx.lineWidth = 2
            ctx.setLineDash(change.isFirstDistance ? [3, 3] : [5, 5])
            
            // Draw vertical line
            ctx.beginPath()
            ctx.moveTo(x, chartArea.top)
            ctx.lineTo(x, chartArea.bottom)
            ctx.stroke()
            
            // Draw label in a rectangle halfway up the line
            const roundedDistance = Math.round(change.distance || 0)
            const labelText = `${roundedDistance}${change.distanceUnit}`
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            // Calculate text dimensions for rectangle size
            const textMetrics = ctx.measureText(labelText)
            const textWidth = textMetrics.width
            const padding = 8
            const rectWidth = textWidth + (padding * 2)
            const rectHeight = 20
            
            // Position the label halfway up the line
            const lineHeight = chartArea.bottom - chartArea.top
            const labelY = chartArea.top + (lineHeight / 2)
            const labelX = x - (rectWidth / 2)
            const labelBoxY = labelY - (rectHeight / 2)
            
            // Draw shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
            ctx.fillRect(labelX + 1, labelBoxY + 1, rectWidth, rectHeight)
            
            // Draw background rectangle (same color for all labels)
            ctx.fillStyle = 'rgba(255, 99, 132, 0.95)'
            ctx.fillRect(labelX, labelBoxY, rectWidth, rectHeight)
            
            // Draw border
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.setLineDash([])
            ctx.strokeRect(labelX, labelBoxY, rectWidth, rectHeight)
            
            // Draw text
            ctx.fillStyle = 'white'
            ctx.fillText(labelText, x, labelY)
            
            ctx.restore()
          })
        }
      }]
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
