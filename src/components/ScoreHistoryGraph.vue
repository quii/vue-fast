<template>
  <div class="graph-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  historyData: {
    type: Array,
    required: true
  },
  isHandicapGraph: {
    type: Boolean,
    default: false
  },
  graphTitle: {
    type: String,
    default: ""
  }
});

const chartCanvas = ref(null);
let chart = null;

// Add a computed property to get the capitalized round name
const capitalizedRoundName = computed(() => {
  if (props.isHandicapGraph) return "Handicap";
  if (!props.historyData.length || !props.historyData[0].gameType) return "Round";

  return props.historyData[0].gameType
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const graphTitle = computed(() => {
  if (props.graphTitle) {
    return props.graphTitle;
  }
  return props.isHandicapGraph ? "Handicap Progress" : `${capitalizedRoundName.value} Progress`;
});

function renderChart() {
  if (!chartCanvas.value || props.historyData.length === 0) return;

  // Sort data by date
  const sortedData = [...props.historyData].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Extract dates
  const dates = sortedData.map(item => new Date(item.date).toLocaleDateString("en-GB"));

  // Extract scores or handicaps based on the graph type
  const values = props.isHandicapGraph
    ? sortedData.map(item => item.handicap)
    : sortedData.map(item => item.score);

  // Calculate min and max for Y axis with appropriate padding
  let minValue, maxValue;

  if (props.isHandicapGraph) {
    // For handicap, we want to show the full range from 0 to 100 (or higher if needed)
    const minHandicap = Math.min(...values);
    const maxHandicap = Math.max(...values);

    // Ensure we have enough padding to show the trend clearly
    minValue = Math.max(0, minHandicap - 5);
    maxValue = maxHandicap + 5;

    // Ensure we have a reasonable range (at least 20 points)
    if (maxValue - minValue < 20) {
      maxValue = minValue + 20;
    }
  } else {
    // For scores, use the existing logic
    minValue = Math.max(Math.min(...values) - 10, 0);
    maxValue = Math.max(...values) + 10;
  }

  // Destroy previous chart if it exists
  if (chart) {
    chart.destroy();
  }

  // Create new chart
  chart = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: props.isHandicapGraph ? "Handicap" : "Score",
        data: values,
        borderColor: props.isHandicapGraph ? "#e74c3c" : "#3490dc",
        backgroundColor: props.isHandicapGraph
          ? "rgba(231, 76, 60, 0.1)"
          : "rgba(52, 144, 220, 0.1)",
        borderWidth: 2,
        pointBackgroundColor: props.isHandicapGraph ? "#e74c3c" : "#3490dc",
        pointRadius: 4,
        tension: 0.2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: graphTitle.value,
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              return dates[tooltipItems[0].dataIndex];
            },
            label: (tooltipItem) => {
              const value = values[tooltipItem.dataIndex];
              return props.isHandicapGraph
                ? `Handicap: ${value}`
                : `Score: ${value}`;
            },
            afterLabel: (tooltipItem) => {
              if (props.isHandicapGraph) {
                // Add round type info for handicap graph
                const item = sortedData[tooltipItem.dataIndex];
                return `Round: ${item.gameType}`;
              }
              return "";
            }
          }
        }
      },
      scales: {
        y: {
          min: minValue,
          max: maxValue,
          title: {
            display: true,
            text: props.isHandicapGraph ? "Handicap" : "Score"
          }
        },
        x: {
          title: {
            display: true,
            text: "Date"
          }
        }
      }
    }
  });
}

onMounted(() => {
  renderChart();
});

watch(() => [props.historyData, props.isHandicapGraph], () => {
  renderChart();
}, { deep: true });
</script>

<style scoped>
.graph-container {
  height: 70vh;
  width: 100%;
  margin: 0 auto;
  padding: 10px;
}
</style>
