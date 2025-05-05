<template>
  <BaseModal v-if="visible" :title="graphTitle">
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <ButtonGroup class="modal-actions">
      <BaseButton
        variant="primary"
        @click="$emit('close')"
      >
        Close
      </BaseButton>
    </ButtonGroup>
  </BaseModal>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";

const props = defineProps({
  historyData: {
    type: Array,
    required: true
  },
  isHandicapGraph: {
    type: Boolean,
    default: false
  },
  isArrowsGraph: {
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

defineEmits(['close']);

const chartCanvas = ref(null);
let chart = null;

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Determine if we're on a portrait screen
const isPortraitOrientation = () => {
  return window.innerHeight > window.innerWidth;
};

// Prepare chart data based on the type of graph
const chartData = computed(() => {
  if (props.isArrowsGraph) {
    return {
      labels: props.historyData.map(item => formatDate(item.date)),
      datasets: [
        {
          label: 'Arrows per Session',
          data: props.historyData.map(item => item.arrowCount),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          type: 'bar'
        },
        {
          label: 'Cumulative Arrows',
          data: props.historyData.map(item => item.cumulativeArrows),
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    };
  } else if (props.isHandicapGraph) {
    return {
      labels: props.historyData.map(item => formatDate(item.date)),
      datasets: [{
        label: 'Handicap',
        data: props.historyData.map(item => item.handicap),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false
      }]
    };
  } else {
    // Regular score graph
    return {
      labels: props.historyData.map(item => formatDate(item.date)),
      datasets: [{
        label: 'Score',
        data: props.historyData.map(item => item.score),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false
      }]
    };
  }
});

// Get the maximum value for the y-axis to help with scaling
const getMaxYValue = (data, property) => {
  if (!data || data.length === 0) return 100;
  return Math.max(...data.map(item => item[property] || 0)) * 1.1; // Add 10% headroom
};

// Get the minimum value for the y-axis to help with scaling
const getMinYValue = (data, property) => {
  if (!data || data.length === 0) return 0;
  const min = Math.min(...data.map(item => item[property] || 0));
  return Math.max(0, min * 0.9); // Subtract 10% but don't go below 0
};

// Calculate appropriate tick spacing based on data range
const calculateTickSpacing = (min, max) => {
  const range = max - min;

  // For portrait orientation, use fewer ticks
  if (isPortraitOrientation()) {
    if (range > 500) return Math.ceil(range / 5 / 100) * 100;
    if (range > 200) return Math.ceil(range / 5 / 50) * 50;
    if (range > 100) return Math.ceil(range / 5 / 20) * 20;
    if (range > 50) return 10;
    return 5;
  } else {
    // For landscape, we can use more ticks
    if (range > 500) return Math.ceil(range / 10 / 50) * 50;
    if (range > 200) return Math.ceil(range / 10 / 20) * 20;
    if (range > 100) return Math.ceil(range / 10 / 10) * 10;
    if (range > 50) return 5;
    return 2;
  }
};

// Chart options based on the type of graph
const chartOptions = computed(() => {
  // Base options that apply to all chart types
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: isPortraitOrientation() ? 30 : 20,
        bottom: 10,
        left: isPortraitOrientation() ? 15 : 20
      }
    },
    plugins: {
      legend: {
        position: isPortraitOrientation() ? 'top' : 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: isPortraitOrientation() ? 10 : 12
          }
        }
      }
    }
  };

  if (props.isArrowsGraph) {
    // Calculate appropriate tick spacing for arrows graph
    const maxArrowsPerSession = getMaxYValue(props.historyData, 'arrowCount');
    const maxCumulativeArrows = getMaxYValue(props.historyData, 'cumulativeArrows');

    const arrowsTickSpacing = calculateTickSpacing(0, maxArrowsPerSession);
    const cumulativeTickSpacing = calculateTickSpacing(0, maxCumulativeArrows);

    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: maxArrowsPerSession,
          ticks: {
            stepSize: arrowsTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Arrows per Session',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          suggestedMax: maxCumulativeArrows,
          ticks: {
            stepSize: cumulativeTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Total Arrows',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: isPortraitOrientation() ? 45 : 0,
            font: {
              size: isPortraitOrientation() ? 8 : 10
            }
          },
          title: {
            display: true,
            text: 'Date',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = props.historyData[tooltipItems[0].dataIndex];
              return `${formatDate(item.date)} - ${item.gameType}`;
            },
            label: function(context) {
              const item = props.historyData[context.dataIndex];
              if (context.datasetIndex === 0) {
                return `Arrows: ${item.arrowCount}`;
              } else {
                return `Total Arrows: ${item.cumulativeArrows}`;
              }
            }
          }
        }
      }
    };
  } else if (props.isHandicapGraph) {
    // Calculate appropriate tick spacing for handicap graph
    const minHandicap = getMinYValue(props.historyData, 'handicap');
    const maxHandicap = getMaxYValue(props.historyData, 'handicap');
    const handicapTickSpacing = calculateTickSpacing(minHandicap, maxHandicap);

    return {
      ...baseOptions,
      scales: {
        y: {
          reverse: true, // Lower handicap is better
          suggestedMin: minHandicap,
          suggestedMax: maxHandicap,
          ticks: {
            stepSize: handicapTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Handicap',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: isPortraitOrientation() ? 45 : 0,
            font: {
              size: isPortraitOrientation() ? 8 : 10
            }
          },
          title: {
            display: true,
            text: 'Date',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = props.historyData[tooltipItems[0].dataIndex];
              return `${formatDate(item.date)} - ${item.gameType}`;
            },
            label: function(context) {
              const item = props.historyData[context.dataIndex];
              return `Handicap: ${item.handicap}`;
            }
          }
        }
      }
    };
  } else {
    // Calculate appropriate tick spacing for score graph
    const minScore = getMinYValue(props.historyData, 'score');
    const maxScore = getMaxYValue(props.historyData, 'score');
    const scoreTickSpacing = calculateTickSpacing(minScore, maxScore);

    return {
      ...baseOptions,
      scales: {
        y: {
          suggestedMin: minScore,
          suggestedMax: maxScore,
          ticks: {
            stepSize: scoreTickSpacing,
            font: {
              size: isPortraitOrientation() ? 9 : 11
            }
          },
          title: {
            display: true,
            text: 'Score',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: isPortraitOrientation() ? 45 : 0,
            font: {
              size: isPortraitOrientation() ? 8 : 10
            }
          },
          title: {
            display: true,
            text: 'Date',
            font: {
              size: isPortraitOrientation() ? 10 : 12
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = props.historyData[tooltipItems[0].dataIndex];
              return `${formatDate(item.date)} - ${item.gameType}`;
            },
            label: function(context) {
              const item = props.historyData[context.dataIndex];
              return `Score: ${item.score}`;
            }
          }
        }
      }
    };
  }
});

// Function to create or update the chart
const updateChart = () => {
  if (!chartCanvas.value) return;

  if (chart) {
    chart.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  chart = new Chart(ctx, {
    type: props.isArrowsGraph ? 'bar' : 'line',
    data: chartData.value,
    options: chartOptions.value
  });
};

// Handle window resize to update chart layout
const handleResize = () => {
  if (props.visible) {
    updateChart();
  }
};

// Watch for changes in visibility or data
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Small delay to ensure the canvas is in the DOM
    setTimeout(() => {
      updateChart();
      window.addEventListener('resize', handleResize);
    }, 100);
  } else {
    window.removeEventListener('resize', handleResize);
  }
});

watch(() => props.historyData, () => {
  if (props.visible) {
    updateChart();
  }
}, { deep: true });

watch(() => props.isArrowsGraph, () => {
  if (props.visible) {
    updateChart();
  }
});

// Clean up when component is unmounted
onMounted(() => {
  if (props.visible) {
    updateChart();
    window.addEventListener('resize', handleResize);
  }
});
</script>

<style scoped>
/* Override the BaseModal width for the graph modal */
:deep(.modal-content) {
  max-width: 800px !important;
  width: 95vw !important;
}

.chart-wrapper {
  height: 60vh;
  width: 100%;
  position: relative;
  margin-bottom: 1rem;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .chart-wrapper {
    height: 70vh;
  }
}
</style>
