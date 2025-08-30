<template>
  <div class="page">
    <BaseTopBar 
      title="Distance Performance" 
      :action-buttons="actionButtons"
      @action="handleTopBarAction"
    />
    
    <!-- Distance Filter Controls -->
    <DistanceSliders
      :model-min-distance="displayedMinDistance"
      :model-max-distance="displayedMaxDistance"
      :model-unit="distanceUnit"
      @update:min-distance="displayedMinDistance = $event"
      @update:max-distance="displayedMaxDistance = $event"
      @update:unit="distanceUnit = $event"
    />
    
    <div class="distance-performance-content">
      <div v-if="distanceStats.distances.length === 0" class="no-data">
        <p>No distance performance data available. Shoot some rounds to see your stats!</p>
      </div>
      
      <div v-else class="distances-list">
        <BaseCard v-for="(distance, index) in distanceStats.distances" :key="`distance-${distance.distance || 'fixed'}-${distance.unit}-${index}`" class="distance-card">
          <h3 class="distance-title">
            {{ formatDistanceName(distance.distance, distance.unit) }}
          </h3>
          
          <!-- Key Statistics -->
          <StatisticsTable :statistics="getDistanceStatistics(distance)" :show-header="false" />
          
          <!-- Performance Over Time Chart -->
          <div class="chart-section">
            <div class="chart-container">
              <canvas :id="`chart-${distance.distance}-${distance.unit}`"></canvas>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { useUserStore } from '@/stores/user'
import { analyzeDistancePerformance } from '@/domain/scoring/distance_performance'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import BaseCard from '@/components/BaseCard.vue'
import StatisticsTable from '@/components/StatisticsTable.vue'
import DistanceSliders from '@/components/DistanceSliders.vue'
import MetricIcon from '@/components/icons/MetricIcon.vue'
import ImperialIcon from '@/components/icons/ImperialIcon.vue'
import { Chart } from 'chart.js'
import { yards, meters, toYards, toMeters } from '@/domain/distance/distance'

// Chart.js components are registered globally in createApp.ts

const route = useRoute()
const historyStore = useHistoryStore()
const userStore = useUserStore()

// Distance filtering state
const minDistance = ref(0)
const maxDistance = ref(100)
const distanceUnit = ref('yards')

// Unit filtering state (separate from display unit)
const showImperialStats = ref(true)
const showMetricStats = ref(true)

// Initialize from query parameters
const queryMin = parseInt(route.query.minDistance)
const queryMax = parseInt(route.query.maxDistance)
const queryUnit = route.query.unit

if (!isNaN(queryMin)) {
  minDistance.value = queryMin
}
if (!isNaN(queryMax)) {
  maxDistance.value = queryMax  
}
if (queryUnit === 'meters' || queryUnit === 'yards') {
  distanceUnit.value = queryUnit
  // When navigating with a specific unit, filter to show only that unit type
  if (queryUnit === 'meters') {
    showImperialStats.value = false
    showMetricStats.value = true
  } else if (queryUnit === 'yards') {
    showImperialStats.value = true
    showMetricStats.value = false
  }
}

// Action buttons for the top bar (filtering, not display unit)
const actionButtons = computed(() => [
  {
    iconComponent: ImperialIcon,
    label: "Imperial",
    action: "toggle-imperial",
    active: showImperialStats.value
  },
  {
    iconComponent: MetricIcon, 
    label: "Metric",
    action: "toggle-metric",
    active: showMetricStats.value
  }
])

// Handle top bar actions
function handleTopBarAction(actionData) {
  if (actionData.action === 'toggle-imperial') {
    showImperialStats.value = !showImperialStats.value
  } else if (actionData.action === 'toggle-metric') {
    showMetricStats.value = !showMetricStats.value
  }
}

// Display distance computeds for unit conversion
const displayedMinDistance = computed({
  get: () => {
    if (distanceUnit.value === "meters") {
      return Math.round(toMeters(yards(minDistance.value)));
    }
    return minDistance.value;
  },
  set: (value) => {
    if (distanceUnit.value === "meters") {
      minDistance.value = Math.round(toYards(meters(value)));
    } else {
      minDistance.value = value;
    }
  }
});

const displayedMaxDistance = computed({
  get: () => {
    if (distanceUnit.value === "meters") {
      return Math.round(toMeters(yards(maxDistance.value)));
    }
    return maxDistance.value;
  },
  set: (value) => {
    if (distanceUnit.value === "meters") {
      maxDistance.value = Math.round(toYards(meters(value)));
    } else {
      maxDistance.value = value;
    }
  }
});

// Get distance performance data with filtering
const distanceStats = computed(() => {
  const allHistory = historyStore.getFilteredHistory({}, userStore.user)
  const stats = analyzeDistancePerformance(allHistory)
  
  // Filter distances based on unit type and slider range
  const filteredDistances = stats.distances.filter(distance => {
    if (distance.distance === null) return true // Always show "Fixed Distance"
    
    // Unit type filtering
    const isImperial = distance.unit === 'yd'
    const isMetric = distance.unit === 'm'
    
    if (isImperial && !showImperialStats.value) return false
    if (isMetric && !showMetricStats.value) return false
    
    // Distance range filtering
    const distanceInYards = isMetric ? Math.round(toYards(meters(distance.distance))) : distance.distance
    return distanceInYards >= minDistance.value && distanceInYards <= maxDistance.value
  })
  
  // Deduplicate distances to prevent Vue key warnings during reactive updates
  const seen = new Set()
  const deduplicatedDistances = filteredDistances.filter(distance => {
    const key = `${distance.distance}-${distance.unit}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
  
  return {
    ...stats,
    distances: deduplicatedDistances
  }
})

function formatDistanceName(distance, unit) {
  if (distance === null) {
    return 'Fixed Distance'
  }
  return `${distance}${unit}`
}

function getDistanceStatistics(distance) {
  return [
    {
      label: 'Best End Total',
      value: distance.bestEndTotal
    },
    {
      label: 'Rounds Shot',
      value: distance.roundsShot
    },
    {
      label: 'Arrows Shot',
      value: distance.arrowsShot
    }
  ]
}

// Chart creation
let charts = []

function createChart(distance, canvasElement) {
  if (!canvasElement) return
  
  const ctx = canvasElement.getContext('2d')
  
  // Get computed CSS variables for dark mode support (same as EndTotalChart)
  const rootStyle = getComputedStyle(document.documentElement)
  const textColor = rootStyle.getPropertyValue('--color-text').trim()
  
  // Calculate min/max values for Y-axis scaling
  const dataValues = distance.averageEndTotalsOverTime.map(point => point.averageEndTotal)
  const minValue = Math.min(...dataValues)
  const maxValue = Math.max(...dataValues)
  
  // Add some padding to the range (10% on each side)
  const range = maxValue - minValue
  const padding = Math.max(range * 0.1, 1) // Minimum padding of 1
  const yMin = Math.max(0, minValue - padding) // Don't go below 0
  const yMax = maxValue + padding
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: distance.averageEndTotalsOverTime.map(point => {
        const date = new Date(point.date)
        return date.toLocaleDateString('en-GB', { 
          month: 'short', 
          day: 'numeric' 
        })
      }),
      datasets: [{
        label: 'Average End Total',
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Same as EndTotalChart
        borderColor: 'rgba(75, 192, 192, 1)', // Same as EndTotalChart
        borderWidth: 2,
        fill: false,
        tension: 0.4, // Same as EndTotalChart for smooth curves
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
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
              return `Average: ${context.parsed.y.toFixed(1)}`
            }
          }
        }
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)' // Same as EndTotalChart
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
            text: 'Average End Total',
            color: textColor,
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        x: {
          grid: {
            display: false // Same as EndTotalChart
          },
          ticks: {
            color: textColor,
            font: {
              size: 12
            }
          }
        }
      }
    }
  })
  
  charts.push(chart)
}

function destroyAllCharts() {
  charts.forEach(chart => chart.destroy())
  charts = []
}

async function createAllCharts() {
  await nextTick()
  
  // Create charts for each distance
  distanceStats.value.distances.forEach(distance => {
    const canvasId = `chart-${distance.distance}-${distance.unit}`
    const canvasElement = document.getElementById(canvasId)
    if (canvasElement) {
      createChart(distance, canvasElement)
    }
  })
}

async function recreateCharts() {
  destroyAllCharts()
  await createAllCharts()
}

onMounted(() => {
  createAllCharts()
})

// Watch for changes in distance stats and recreate charts
watch(distanceStats, () => {
  recreateCharts()
}, { flush: 'post' })

// Cleanup charts on unmount
onBeforeUnmount(() => {
  destroyAllCharts()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-background);
}

.distance-performance-content {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.distances-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distance-card {
  padding: 0.5rem 0.5rem 0.75rem 0.5rem;
}

.distance-title {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}


.chart-section {
  margin-top: 0.75rem;
}

.chart-container {
  height: 350px;
  position: relative;
  /* Isolate chart touch handling from page scrolling */
  touch-action: manipulation;
  /* Improve performance during chart interactions */
  will-change: contents;
}

.chart-container canvas {
  /* Ensure canvas doesn't interfere with vertical scrolling */
  touch-action: manipulation;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .distance-performance-content {
    padding: 0.5rem;
  }
  
  .chart-container {
    height: 280px;
    /* Extra scrolling reliability on mobile */
    touch-action: manipulation;
  }
}
</style>