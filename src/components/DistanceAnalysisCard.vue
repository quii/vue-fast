<template>
  <BaseCard @click="$emit('click')" class="distance-analysis-card">
    <div class="analysis-content">
      <GraphIcon class="analysis-icon" />
      <div class="analysis-text">
        <h3 class="analysis-title">Analyze Distance Performance</h3>
        <p class="analysis-subtitle">Deep dive into your {{ distanceRangeText }} shooting data</p>
        <div class="analysis-cta">
          <span class="cta-text">View detailed stats →</span>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import GraphIcon from '@/components/icons/GraphIcon.vue'

const props = defineProps({
  minDistance: {
    type: Number,
    required: true
  },
  maxDistance: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'yards',
    validator: (value) => ['yards', 'meters'].includes(value)
  }
})

defineEmits(['click'])

const distanceRangeText = computed(() => {
  if (props.minDistance === props.maxDistance) {
    return `${props.minDistance} ${props.unit}`
  }
  return `${props.minDistance}-${props.maxDistance} ${props.unit}`
})
</script>

<style scoped>
.distance-analysis-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.distance-analysis-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.analysis-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem;
}

.analysis-icon {
  width: 24px;
  height: 24px;
  color: var(--color-highlight, #4CAF50);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.analysis-text {
  flex: 1;
  min-width: 0; /* Allows text to wrap properly */
}

.analysis-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.analysis-subtitle {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.analysis-cta {
  margin: 0;
}

.cta-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-highlight, #4CAF50);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .analysis-content {
    padding: 0.75rem;
  }
  
  .analysis-title {
    font-size: 1rem;
  }
  
  .analysis-subtitle {
    font-size: 0.85rem;
  }
  
  .cta-text {
    font-size: 0.85rem;
  }
}
</style>