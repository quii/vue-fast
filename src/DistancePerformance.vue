<template>
  <div class="page">
    <BaseTopBar title="Distance Performance" />
    
    <div class="distance-performance-content">
      <div v-if="distanceStats.distances.length === 0" class="no-data">
        <p>No distance performance data available. Shoot some rounds to see your stats!</p>
      </div>
      
      <div v-else class="distances-list">
        <BaseCard v-for="distance in distanceStats.distances" :key="`${distance.distance}-${distance.unit}`" class="distance-card">
          <h3 class="distance-title">
            {{ formatDistanceName(distance.distance, distance.unit) }}
          </h3>
          
          <!-- Key Statistics -->
          <StatisticsTable :statistics="getDistanceStatistics(distance)" />
          
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
import { computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { useUserStore } from '@/stores/user'
import { analyzeDistancePerformance } from '@/domain/scoring/distance_performance'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import BaseCard from '@/components/BaseCard.vue'
import StatisticsTable from '@/components/StatisticsTable.vue'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

const route = useRoute()
const historyStore = useHistoryStore()
const userStore = useUserStore()

// Get distance performance data
const distanceStats = computed(() => {
  const allHistory = historyStore.getFilteredHistory({}, userStore.user)
  return analyzeDistancePerformance(allHistory)
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

onMounted(async () => {
  await nextTick()
  
  // Create charts for each distance
  distanceStats.value.distances.forEach(distance => {
    const canvasId = `chart-${distance.distance}-${distance.unit}`
    const canvasElement = document.getElementById(canvasId)
    if (canvasElement) {
      createChart(distance, canvasElement)
    }
  })
})

// Cleanup charts on unmount  
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  charts.forEach(chart => chart.destroy())
  charts = []
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
  padding: 0.75rem;
}

.distance-title {
  margin: 0 0 0.5rem 0;
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
}

/* Mobile responsive */
@media (max-width: 768px) {
  .distance-performance-content {
    padding: 0.5rem;
  }
  
  .chart-container {
    height: 280px;
  }
}
</style>