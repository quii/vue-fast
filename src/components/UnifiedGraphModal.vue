<template>
  <BaseModal v-if="visible" :title="title">
    <div v-if="hasData" class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-else class="no-data-message">
      <p>{{ noDataMessage || 'No data available to display.' }}</p>
      <p class="hint">{{ noDataHint || 'Data will appear when available.' }}</p>
    </div>

    <!-- Share status messages -->
    <div v-if="shareSuccess || shareError" class="share-status">
      <p v-if="shareSuccess" class="share-success">Chart shared successfully! 📊</p>
      <p v-if="shareError" class="share-error">{{ shareError }}</p>
    </div>

    <ButtonGroup class="modal-actions">
      <BaseButton
        v-if="hasData && enableShare"
        variant="outline"
        @click="shareChart"
        :disabled="!chart || shareSuccess || !!shareError"
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
import { ref, watch, onMounted, computed, inject, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import ButtonGroup from "@/components/ui/ButtonGroup.vue";
import ShareIcon from "@/components/icons/ShareIcon.vue";

const props = defineProps({
  // Modal visibility
  visible: {
    type: Boolean,
    default: false
  },
  
  // Chart title displayed in modal header
  title: {
    type: String,
    required: true
  },
  
  // Chart.js data object
  chartData: {
    type: Object,
    required: true
  },
  
  // Chart.js options object
  chartOptions: {
    type: Object,
    required: true
  },
  
  // Chart type (line, bar, etc.)
  chartType: {
    type: String,
    default: 'line'
  },
  
  // No data message
  noDataMessage: {
    type: String,
    default: 'No data available to display.'
  },
  
  // No data hint
  noDataHint: {
    type: String,
    default: 'Data will appear when available.'
  },
  
  // Enable/disable share functionality
  enableShare: {
    type: Boolean,
    default: true
  },
  
  // Custom share title (defaults to modal title)
  shareTitle: {
    type: String,
    default: ''
  }
});

defineEmits(['close']);

const sharingService = inject('sharingService');
const chartCanvas = ref(null);
const chart = ref(null);

// Share state
const shareSuccess = ref(false);
const shareError = ref('');

// Check if we have data to display
const hasData = computed(() => {
  return props.chartData && 
         props.chartData.datasets && 
         props.chartData.datasets.length > 0 &&
         props.chartData.datasets.some(dataset => dataset.data && dataset.data.length > 0);
});

// Function to create or update the chart
const updateChart = async () => {
  if (!chartCanvas.value || !hasData.value) return;

  if (chart.value) {
    chart.value.destroy();
  }

  await nextTick();

  const ctx = chartCanvas.value.getContext('2d');
  
  try {
    chart.value = new Chart(ctx, {
      type: props.chartType,
      data: props.chartData,
      options: props.chartOptions
    });
  } catch (error) {
    console.error('Chart creation failed:', error);
  }
};

// Handle window resize to update chart layout
const handleResize = () => {
  if (props.visible && chart.value) {
    chart.value.resize();
  }
};

// Share the chart as an image
const shareChart = async () => {
  if (!chart.value || !chartCanvas.value) {
    shareError.value = 'Chart not available for sharing';
    setTimeout(() => shareError.value = '', 3000);
    return;
  }

  shareSuccess.value = false;
  shareError.value = '';

  try {
    // Convert chart to image data URL
    const dataUrl = chart.value.toBase64Image('image/png', 1.0);
    
    // Create share text
    const shareText = `📊 ${props.shareTitle || props.title}\n\nGenerated from Archery Score Tracker`;
    
    // Try native sharing first
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        const filesArray = [new File([blob], 'archery-chart.png', { type: 'image/png' })];
        
        if (navigator.canShare({ files: filesArray })) {
          await navigator.share({
            title: 'Archery Chart',
            text: shareText,
            files: filesArray
          });
          
          shareSuccess.value = true;
          setTimeout(() => shareSuccess.value = false, 2000);
          return;
        }
      } catch (error) {
        console.log('Native sharing failed, trying fallback:', error);
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
    console.error('Error sharing chart:', error);
    shareError.value = 'Failed to share chart';
    setTimeout(() => shareError.value = '', 3000);
  }
};

// Watch for changes in visibility or data
watch(() => props.visible, (newValue) => {
  if (newValue && hasData.value) {
    // Small delay to ensure the canvas is in the DOM
    setTimeout(() => {
      updateChart();
      window.addEventListener('resize', handleResize);
    }, 100);
  } else {
    window.removeEventListener('resize', handleResize);
    // Reset share state when modal closes
    shareSuccess.value = false;
    shareError.value = '';
  }
});

watch(() => [props.chartData, props.chartOptions], () => {
  if (props.visible && hasData.value) {
    updateChart();
  }
}, { deep: true });

// Clean up when component is unmounted
onMounted(() => {
  if (props.visible && hasData.value) {
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
