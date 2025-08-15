<template>
  <div 
    class="achievement-badge"
    :class="{ 
      'earned': isEarned,
      'bronze': tier === 'bronze',
      'silver': tier === 'silver', 
      'gold': tier === 'gold',
      'diamond': tier === 'diamond'
    }"
  >
    <div class="badge-content">
      <div class="badge-title">{{ title }}</div>
      <div class="badge-description">{{ description }}</div>
      
      <div v-if="!isEarned" class="progress-section">
        <div class="progress-text">
          <span v-if="targetArrows">
            {{ currentArrows.toLocaleString() }} / {{ targetArrows.toLocaleString() }} arrows
          </span>
          <span v-else-if="targetScore">
            {{ currentScore || 0 }} / {{ targetScore }} points on {{ gameType?.toUpperCase() }}
          </span>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        
        <div class="progress-percentage">
          {{ Math.round(progressPercentage) }}% complete
        </div>
      </div>
    </div>
    
    <div v-if="isEarned" class="earned-indicator">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  description: String,
  iconComponent: Object,
  tier: {
    type: String,
    default: 'bronze',
    validator: value => ['bronze', 'silver', 'gold'].includes(value)
  },
  isEarned: Boolean,
  progressPercentage: Number,
  targetArrows: Number,
  currentArrows: Number,
  targetScore: Number,
  currentScore: Number,
  gameType: String
})
</script>

<style scoped>
.achievement-badge {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--badge-background);
  border: 2px solid var(--badge-border);
  border-radius: 16px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
  color: var(--badge-text-color);
}

.achievement-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--badge-accent), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement-badge.earned::before {
  opacity: 1;
}

/* Bold tier-themed backgrounds */
.achievement-badge.bronze {
  --badge-background: linear-gradient(135deg, #cd7f32, #daa520);
  --badge-border: #cd7f32;
  --badge-text-color: white;
  --badge-icon-bg: rgba(255, 255, 255, 0.2);
  --badge-accent: #cd7f32;
}

.achievement-badge.silver {
  --badge-background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  --badge-border: #c0c0c0;
  --badge-text-color: #2c2c2c;
  --badge-icon-bg: rgba(0, 0, 0, 0.1);
  --badge-accent: #c0c0c0;
}

.achievement-badge.gold {
  --badge-background: linear-gradient(135deg, #ffd700, #ffed4e);
  --badge-border: #ffd700;
  --badge-text-color: #2c2c2c;
  --badge-icon-bg: rgba(0, 0, 0, 0.1);
  --badge-accent: #ffd700;
}

.achievement-badge.earned {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.badge-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--badge-icon-bg);
  border-radius: 50%;
  color: var(--badge-text-color);
  transition: all 0.3s ease;
}

.badge-content {
  flex: 1;
  min-width: 0;
}

.badge-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--badge-text-color);
  margin-bottom: 0.25rem;
}

.badge-description {
  color: var(--badge-text-color);
  opacity: 0.9;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.progress-section {
  margin-top: 0.5rem;
}

.progress-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--badge-text-color);
  margin-bottom: 0.5rem;
}

.progress-bar {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: rgba(255, 255, 255, 0.8);
  height: 100%;
  border-radius: 8px;
  transition: width 0.4s ease;
  min-width: 2px;
}

.progress-percentage {
  font-size: 0.8rem;
  color: var(--badge-text-color);
  opacity: 0.8;
  text-align: right;
}

.earned-indicator {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--badge-text-color);
  opacity: 0.9;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .achievement-badge {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .badge-icon {
    width: 40px;
    height: 40px;
  }
  
  .badge-title {
    font-size: 1.1rem;
  }
}

/* Dark mode adjustments - slightly darker gradients */
@media (prefers-color-scheme: dark) {
  .achievement-badge.bronze {
    --badge-background: linear-gradient(135deg, #a0632a, #b8722b);
  }
  
  .achievement-badge.silver {
    --badge-background: linear-gradient(135deg, #a0a0a0, #c0c0c0);
  }
  
  .achievement-badge.gold {
    --badge-background: linear-gradient(135deg, #e6c200, #ffed4e);
  }
}
</style>