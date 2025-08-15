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
            Best: {{ currentScore || 0 }} / {{ targetScore }} points<span v-if="gameType"> on {{ gameType.toUpperCase() }}</span>
          </span>
        </div>
        
        <!-- Only show progress bar for arrow-count achievements -->
        <div v-if="targetArrows" class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        
        <!-- Only show percentage for arrow-count achievements -->
        <div v-if="targetArrows" class="progress-percentage">
          {{ Math.round(progressPercentage) }}% complete
        </div>
      </div>
    </div>
    
    <!-- Tier indicator for unearned achievements -->
    <div v-if="!isEarned" class="tier-indicator" :class="tier">
      <span class="tier-text">{{ tier.charAt(0).toUpperCase() + tier.slice(1) }}</span>
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
  tier: {
    type: String,
    default: 'bronze',
    validator: value => ['bronze', 'silver', 'gold', 'diamond'].includes(value)
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
  padding: 1rem 1.25rem;
  background: var(--badge-background);
  border: 2px solid var(--badge-border);
  border-radius: 12px;
  margin-bottom: 0.75rem;
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

/* Metallic tier-themed backgrounds with shimmer effects */
.achievement-badge.bronze {
  --badge-background: linear-gradient(135deg, 
    #8b4513 0%, 
    #cd7f32 25%, 
    #e6a85c 50%, 
    #cd7f32 75%, 
    #8b4513 100%);
  --badge-border: #cd7f32;
  --badge-text-color: white;
  --badge-icon-bg: rgba(255, 255, 255, 0.15);
  --badge-accent: #cd7f32;
  position: relative;
  background: var(--badge-background);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
}

/* Unearned bronze - muted, desaturated */
.achievement-badge.bronze:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: #cd7f32;
  --badge-text-color: var(--color-text-mute);
  --badge-icon-bg: rgba(255, 255, 255, 0.1);
  --badge-accent: #cd7f32;
  background: var(--badge-background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.7;
  border-left: 4px solid #cd7f32;
}

/* Only earned achievements get shimmer */
.achievement-badge.bronze.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent);
  animation: shimmer 3s infinite;
  border-radius: inherit;
  pointer-events: none;
}

/* Only earned achievements get shimmer */
.achievement-badge.bronze.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent);
  animation: shimmer 3s infinite;
  border-radius: inherit;
  pointer-events: none;
}

.achievement-badge.silver {
  --badge-background: linear-gradient(135deg, 
    #708090 0%, 
    #c0c0c0 25%, 
    #e8e8e8 50%, 
    #c0c0c0 75%, 
    #708090 100%);
  --badge-border: #c0c0c0;
  --badge-text-color: #2c2c2c;
  --badge-icon-bg: rgba(0, 0, 0, 0.08);
  --badge-accent: #c0c0c0;
  position: relative;
  background: var(--badge-background);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.25);
}

/* Unearned silver - muted, desaturated */
.achievement-badge.silver:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: #c0c0c0;
  --badge-text-color: var(--color-text-mute);
  --badge-icon-bg: rgba(255, 255, 255, 0.1);
  --badge-accent: #c0c0c0;
  background: var(--badge-background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.7;
  border-left: 4px solid #c0c0c0;
}

.achievement-badge.silver.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent);
  animation: shimmer 2.5s infinite;
  border-radius: inherit;
  pointer-events: none;
}

.achievement-badge.silver.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent);
  animation: shimmer 2.5s infinite;
  border-radius: inherit;
  pointer-events: none;
}

.achievement-badge.gold {
  --badge-background: linear-gradient(135deg, 
    #b8860b 0%, 
    #ffd700 25%, 
    #ffef94 50%, 
    #ffd700 75%, 
    #b8860b 100%);
  --badge-border: #ffd700;
  --badge-text-color: #2c2c2c;
  --badge-icon-bg: rgba(0, 0, 0, 0.08);
  --badge-accent: #ffd700;
  position: relative;
  background: var(--badge-background);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

/* Unearned gold - muted, desaturated */
.achievement-badge.gold:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: #ffd700;
  --badge-text-color: var(--color-text-mute);
  --badge-icon-bg: rgba(255, 255, 255, 0.1);
  --badge-accent: #ffd700;
  background: var(--badge-background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.7;
  border-left: 4px solid #ffd700;
}

/* Only earned achievements get shimmer */
.achievement-badge.gold.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.5), 
    transparent);
  animation: shimmer 2s infinite;
  border-radius: inherit;
  pointer-events: none;
}

/* Only earned achievements get shimmer */
.achievement-badge.gold.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.5), 
    transparent);
  animation: shimmer 2s infinite;
  border-radius: inherit;
  pointer-events: none;
}

.achievement-badge.diamond {
  --badge-background: linear-gradient(135deg, 
    #4169e1 0%, 
    #87ceeb 25%, 
    #f0f8ff 50%, 
    #87ceeb 75%, 
    #4169e1 100%);
  --badge-border: #87ceeb;
  --badge-text-color: #2c2c2c;
  --badge-icon-bg: rgba(0, 0, 0, 0.08);
  --badge-accent: #87ceeb;
  position: relative;
  background: var(--badge-background);
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.3);
}

/* Unearned diamond - muted, desaturated */
.achievement-badge.diamond:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: #87ceeb;
  --badge-text-color: var(--color-text-mute);
  --badge-icon-bg: rgba(255, 255, 255, 0.1);
  --badge-accent: #87ceeb;
  background: var(--badge-background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.7;
  border-left: 4px solid #87ceeb;
}

/* Only earned achievements get shimmer */
.achievement-badge.diamond.earned::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.6), 
    transparent);
  animation: shimmer 1.5s infinite;
  border-radius: inherit;
  pointer-events: none;
}

.achievement-badge.earned {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.achievement-badge.earned.bronze {
  box-shadow: 
    0 4px 12px rgba(139, 69, 19, 0.25),
    0 2px 6px rgba(205, 127, 50, 0.2);
}

.achievement-badge.earned.silver {
  box-shadow: 
    0 4px 12px rgba(192, 192, 192, 0.3),
    0 2px 6px rgba(169, 169, 169, 0.25);
}

.achievement-badge.earned.gold {
  box-shadow: 
    0 4px 12px rgba(255, 215, 0, 0.4),
    0 2px 6px rgba(218, 165, 32, 0.3);
}

.achievement-badge.earned.diamond {
  box-shadow: 
    0 4px 12px rgba(135, 206, 235, 0.4),
    0 2px 6px rgba(70, 130, 180, 0.3);
}

/* Shimmer animation for metallic effect */
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Enhanced metallic progress bar */
.progress-fill {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.4), 
    rgba(255, 255, 255, 0.7), 
    rgba(255, 255, 255, 0.4));
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
  min-width: 2px;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.badge-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--badge-text-color);
  margin-bottom: 0.15rem;
  line-height: 1.2;
}

.badge-description {
  color: var(--badge-text-color);
  opacity: 0.85;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

/* Reduce bottom spacing for earned achievements */
.achievement-badge.earned .badge-description {
  margin-bottom: 0;
}

.progress-section {
  margin-top: 0.25rem;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--badge-text-color);
  margin-bottom: 0.4rem;
}

.progress-bar {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  height: 5px;
  overflow: hidden;
  margin-bottom: 0.4rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.tier-indicator {
  flex-shrink: 0;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
  min-width: 60px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tier-indicator.bronze {
  background: linear-gradient(135deg, #8b4513, #cd7f32);
  color: white;
  box-shadow: 0 2px 4px rgba(139, 69, 19, 0.3);
}

.tier-indicator.silver {
  background: linear-gradient(135deg, #708090, #c0c0c0);
  color: #2c2c2c;
  box-shadow: 0 2px 4px rgba(112, 128, 144, 0.3);
}

.tier-indicator.gold {
  background: linear-gradient(135deg, #b8860b, #ffd700);
  color: #2c2c2c;
  box-shadow: 0 2px 4px rgba(184, 134, 11, 0.3);
}

.tier-indicator.diamond {
  background: linear-gradient(135deg, #4169e1, #87ceeb);
  color: white;
  box-shadow: 0 2px 4px rgba(65, 105, 225, 0.3);
}

.tier-text {
  font-size: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .achievement-badge {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
  
  .badge-icon {
    width: 40px;
    height: 40px;
  }
  
  .badge-title {
    font-size: 1.4rem;
  }
}
</style>