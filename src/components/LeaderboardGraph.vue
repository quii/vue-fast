<template>
  <BaseModal v-if="visible" :title="formattedTitle">
    <div v-if="hasGraphData" class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-else class="no-data-message">
      <p>No score progression data available to display.</p>
      <p class="hint">Score data will appear as participants shoot arrows.</p>
    </div>

    <!-- Share status messages -->
    <div v-if="shareSuccess || shareError" class="share-status">
      <p v-if="shareSuccess" class="share-success">Chart shared successfully! 📊</p>
      <p v-if="shareError" class="share-error">{{ shareError }}</p>
    </div>

    <ButtonGroup class="modal-actions">
      <BaseButton
        v-if="hasGraphData && chart"
        variant="outline"
        @click="shareChart"
        :disabled="shareSuccess || !!shareError"
        title="Share chart image"
      >
        <ShareIcon />
        {{ shareSuccess ? 'Shared!' : shareError ? 'Error' : 'Share' }}
      </BaseButton>
      
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
import { ref, watch, onMounted, computed, inject } from 'vue';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import ShareIcon from "@/components/icons/ShareIcon.vue";
import { formatRoundName } from '@/domain/scoring/round/formatting';
import { useShootStore } from '@/stores/shoot';
import { roundConfigManager } from '@/domain/scoring/game_types';

const props = defineProps({
  participants: {
    type: Array,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const shootStore = useShootStore();
const sharingService = inject('sharingService');
const chartCanvas = ref(null);
let chart = null;

// Share state
const shareSuccess = ref(false);
const shareError = ref('');

// Computed title that includes date and formatted round name
const formattedTitle = computed(() => {
  // Get the date from the current shoot, default to today if not available
  const shootDate = shootStore.currentShoot?.createdAt || new Date();
  const dateStr = shootDate instanceof Date ? 
    shootDate.toLocaleDateString() : 
    new Date(shootDate).toLocaleDateString();
  
  // Get round name from the first participant (they should all be the same round in a group)
  const roundName = props.participants?.[0]?.roundName || 'Unknown Round';
  const formattedRound = formatRoundName(roundName);
  
  return `${dateStr} - ${formattedRound}`;
});

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Generate a distinct color for each participant
const generateColor = (index) => {
  const colors = [
    'rgba(255, 99, 132, 1)',   // Red
    'rgba(54, 162, 235, 1)',   // Blue
    'rgba(255, 206, 86, 1)',   // Yellow
    'rgba(75, 192, 192, 1)',   // Teal
    'rgba(153, 102, 255, 1)',  // Purple
    'rgba(255, 159, 64, 1)',   // Orange
    'rgba(199, 199, 199, 1)',  // Gray
    'rgba(83, 102, 255, 1)',   // Indigo
    'rgba(255, 99, 255, 1)',   // Pink
    'rgba(99, 255, 132, 1)',   // Green
  ];
  return colors[index % colors.length];
};

// Check if we have enough data for a meaningful graph
const hasGraphData = computed(() => {
  if (!props.participants || props.participants.length < 1) {
    return true; // Show demo data if no participants
  }
  
  // Count participants with any score data
  const participantsWithData = props.participants.filter(p => 
    (p.scores && p.scores.length > 0) || p.totalScore > 0
  )
  
  return participantsWithData.length >= 1;
})

// Prepare cumulative score data for each participant
const chartData = computed(() => {
  const datasets = [];
  
  // If no real participants with data, create demo data for testing
  if (!props.participants || props.participants.length === 0 || 
      !props.participants.some(p => (p.scores && p.scores.length > 0) || p.totalScore > 0)) {
    datasets.push({
      label: 'Demo Archer 1',
      data: [
        { x: 0, y: 0 },   // Start
        { x: 1, y: 42 },  // End 1
        { x: 2, y: 78 },  // End 2
        { x: 3, y: 125 }, // End 3
        { x: 4, y: 158 }, // End 4
        { x: 5, y: 201 }, // End 5
        { x: 6, y: 245 }  // End 6
      ],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    });
    
    datasets.push({
      label: 'Demo Archer 2',
      data: [
        { x: 0, y: 0 },   // Start
        { x: 1, y: 38 },  // End 1
        { x: 2, y: 72 },  // End 2
        { x: 3, y: 108 }, // End 3
        { x: 4, y: 142 }, // End 4
        { x: 5, y: 178 }, // End 5
        { x: 6, y: 214 }  // End 6
      ],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    });
    
    return { datasets };
  }
  
  props.participants.forEach((participant, index) => {
    // Since we don't have historical score updates, we'll create a simplified progression
    // showing current status - if they have individual scores, we can show cumulative progression
    // Otherwise, we'll show a simple progression from 0 to current score
    
    const dataPoints = [];
    
    // Get the round configuration to determine end size
    const roundConfig = roundConfigManager.getRound(participant.roundName);
    const endSize = roundConfig?.endSize || 6; // Default to 6 arrows per end
    
    // Ensure we have a valid timestamp
    const lastUpdated = participant.lastUpdated instanceof Date 
      ? participant.lastUpdated 
      : new Date(participant.lastUpdated || Date.now());
    
    if (participant.scores && participant.scores.length > 0) {
      // Use individual arrow scores to build cumulative progression by end
      let cumulative = 0;
      let currentEndScore = 0;
      let endNumber = 1;
      
      // Start with end 0 (before shooting)
      dataPoints.push({ x: 0, y: 0 });
      
      participant.scores.forEach((score, arrowIndex) => {
        // Convert string scores to numbers, skip invalid ones
        const numericScore = typeof score === 'number' ? score : 
                           (typeof score === 'string' && !isNaN(Number(score))) ? Number(score) : 0;
        
        if (numericScore >= 0) { // Allow 0 scores
          cumulative += numericScore;
          currentEndScore += numericScore;
        }
        
        // Check if we've completed an end
        if ((arrowIndex + 1) % endSize === 0) {
          dataPoints.push({
            x: endNumber,
            y: cumulative
          });
          endNumber++;
          currentEndScore = 0;
        }
      });
      
      // If there are remaining arrows in an incomplete end, add a point for the current progress
      if (participant.scores.length % endSize !== 0) {
        dataPoints.push({
          x: endNumber,
          y: cumulative
        });
      }
      
    } else if (participant.totalScore > 0) {
      // For participants without detailed scores, create a simple progression by estimated ends
      const totalArrows = participant.arrowsShot || Math.max(6, Math.ceil(participant.totalScore / 10));
      const estimatedEnds = Math.ceil(totalArrows / endSize);
      
      // Create progression points (start, incremental ends, current)
      dataPoints.push({ x: 0, y: 0 }); // Starting point
      
      for (let end = 1; end <= estimatedEnds; end++) {
        const progressRatio = end / estimatedEnds;
        const scoreAtEnd = Math.floor(participant.totalScore * progressRatio);
        dataPoints.push({
          x: end,
          y: scoreAtEnd
        });
      }
      
      // Ensure final point shows exact total score
      if (estimatedEnds > 0) {
        dataPoints[dataPoints.length - 1].y = participant.totalScore;
      }
    } else {
      // No score data available
      return;
    }

    const color = generateColor(index);
    
    datasets.push({
      label: participant.archerName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color.replace('1)', '0.1)'),
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    });
  });

  return { datasets };
});

// Chart options optimized for cumulative score progression
const chartOptions = computed(() => {
  return {
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
    scales: {
      x: {
        type: 'linear',
        beginAtZero: true,
        title: {
          display: true,
          text: 'End Number',
          font: {
            size: isPortraitOrientation() ? 10 : 12
          }
        },
        ticks: {
          stepSize: 1,
          font: {
            size: isPortraitOrientation() ? 8 : 10
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cumulative Score',
          font: {
            size: isPortraitOrientation() ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: isPortraitOrientation() ? 9 : 11
          }
        }
      }
    },
    plugins: {
      legend: {
        position: isPortraitOrientation() ? 'top' : 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: isPortraitOrientation() ? 10 : 12
          },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const endNum = tooltipItems[0].parsed.x;
            return endNum === 0 ? 'Start' : `End ${endNum}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
});

// Function to create or update the chart
const updateChart = () => {
  if (!chartCanvas.value) {
    return;
  }

  if (chart) {
    chart.destroy();
  }

  const data = chartData.value;
  
  if (!data.datasets || data.datasets.length === 0) {
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  
  try {
    chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: chartOptions.value
    });
  } catch (error) {
    // Chart creation failed - silently handle or log to external service
  }
};

// Handle window resize to update chart layout
const handleResize = () => {
  if (props.visible) {
    updateChart();
  }
};

// Determine if we're on a portrait screen
const isPortraitOrientation = () => {
  return window.innerHeight > window.innerWidth;
};

// Share the chart as an image
const shareChart = async () => {
  if (!chart || !chartCanvas.value) {
    shareError.value = 'Chart not available for sharing';
    setTimeout(() => shareError.value = '', 3000);
    return;
  }

  try {
    // Convert chart to image data URL
    const dataUrl = chart.toBase64Image('image/png', 1.0);
    
    // Create share text
    const shareText = `📊 ${formattedTitle.value}\n\nGenerated from Live Archery Leaderboard`;
    
    if (navigator.share && navigator.canShare) {
      // Try to share image blob if supported
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const filesArray = [new File([blob], 'archery-graph.png', { type: 'image/png' })];
      
      if (navigator.canShare({ files: filesArray })) {
        await navigator.share({
          title: 'Archery Score Progress',
          text: shareText,
          files: filesArray
        });
        
        shareSuccess.value = true;
        setTimeout(() => shareSuccess.value = false, 2000);
        return;
      }
    }
    
    // Fallback: use sharing service if available
    if (sharingService) {
      await sharingService.shareScoresheet(dataUrl, shareText);
      shareSuccess.value = true;
      setTimeout(() => shareSuccess.value = false, 2000);
    } else {
      // Last resort: try to copy share text to clipboard
      await navigator.clipboard.writeText(shareText + '\n\n(Chart image could not be shared directly)');
      shareSuccess.value = true;
      setTimeout(() => shareSuccess.value = false, 2000);
    }
    
  } catch (error) {
    shareError.value = 'Failed to share chart';
    setTimeout(() => shareError.value = '', 3000);
  }
};

// Check if native sharing is available
const canShareNatively = computed(() => {
  return navigator.share !== undefined;
});

// Watch for changes in visibility or data
watch(() => props.visible, (newValue) => {
  if (newValue && hasGraphData.value) {
    // Small delay to ensure the canvas is in the DOM
    setTimeout(() => {
      updateChart();
      window.addEventListener('resize', handleResize);
    }, 100);
  } else {
    window.removeEventListener('resize', handleResize);
  }
});

watch(() => props.participants, () => {
  if (props.visible && hasGraphData.value) {
    updateChart();
  }
}, { deep: true });

// Clean up when component is unmounted
onMounted(() => {
  if (props.visible && hasGraphData.value) {
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

:deep(.modal-actions) {
  padding: 0.5em 0 !important;
}

.chart-wrapper {
  height: 60vh;
  width: 100%;
  position: relative;
  margin-bottom: 1rem;
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light, #666);
}

.no-data-message p {
  margin: 0.5rem 0;
}

.no-data-message .hint {
  font-size: 0.9em;
  font-style: italic;
}

.share-status {
  text-align: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.share-success {
  color: var(--color-success, #10b981);
  font-weight: 500;
  margin: 0;
}

.share-error {
  color: var(--color-error, #ef4444);
  font-weight: 500;
  margin: 0;
}

@media (max-width: 480px) {
  .chart-wrapper {
    height: 80vh;
  }
}
</style>
