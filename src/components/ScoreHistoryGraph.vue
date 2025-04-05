<template>
  <div v-if="visible" class="graph-modal">
    <div class="graph-modal-content">
      <button class="close-graph" @click="closeGraph">✕</button>
      <div class="graph-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
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
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close"]);

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

function closeGraph() {
  emit("close");
}

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
  if (props.visible) {
    renderChart();
  }
});

watch(() => [props.historyData, props.isHandicapGraph], () => {
  renderChart();
}, { deep: true });

watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Wait for the DOM to update before rendering the chart
    setTimeout(() => {
      renderChart();
    }, 0);
  }
});
</script>

<style scoped>
.graph-container {
  height: 100%;
  width: 100%;
  padding: 10px;
}

.graph-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.graph-modal-content {
  background-color: var(--color-background);
  width: 95%;
  height: 90%;
  border-radius: 8px;
  position: relative;
  padding: 10px;
}

.close-graph {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  color: var(--color-text);
}
</style>
