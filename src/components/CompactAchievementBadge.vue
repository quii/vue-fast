<template>
  <div 
    class="compact-achievement-badge"
    :class="{ 
      'earned': isEarned,
      'clickable': isEarned && achievingShootId,
      'bronze': tier === 'bronze',
      'silver': tier === 'silver', 
      'gold': tier === 'gold',
      'diamond': tier === 'diamond'
    }"
    @click="handleClick"
  >
    <div class="badge-content">
      <div class="badge-title">{{ title }}</div>
      
      <div v-if="!isEarned" class="progress-text">
        <span v-if="targetArrows">
          {{ (currentArrows || 0).toLocaleString() }} / {{ targetArrows.toLocaleString() }} arrows
        </span>
        <span v-else-if="targetScore">
          Best: {{ currentScore || 0 }} / {{ targetScore }} points
        </span>
      </div>
    </div>
    
    <!-- Tier indicator for unearned achievements -->
    <div v-if="!isEarned" class="tier-indicator" :class="tier">
      <span class="tier-text">{{ tier.charAt(0).toUpperCase() + tier.slice(1) }}</span>
    </div>
    
    <!-- Show achieved date instead of tick for earned achievements -->
    <div v-if="isEarned && achievedDate" class="earned-date-indicator">
      {{ formatAchievedDate(achievedDate) }}
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: String,
  tier: {
    type: String,
    default: 'bronze',
    validator: value => ['bronze', 'silver', 'gold', 'diamond'].includes(value)
  },
  isEarned: Boolean,
  targetArrows: Number,
  currentArrows: Number,
  targetScore: Number,
  currentScore: Number,
  achievingShootId: [Number, String],
  achievedDate: String
})

function handleClick() {
  if (props.isEarned && props.achievingShootId) {
    router.push(`/history/${props.achievingShootId}`)
  }
}

function formatAchievedDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.compact-achievement-badge {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--badge-background);
  border: 1px solid var(--badge-border);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
  color: var(--badge-text-color);
  min-height: 60px;
}

/* Use the same tier styling as regular badges but more compact */
.compact-achievement-badge.bronze {
  --badge-background: linear-gradient(135deg, 
    #8b4513 0%, 
    #cd7f32 25%, 
    #e6a85c 50%, 
    #cd7f32 75%, 
    #8b4513 100%);
  --badge-border: #cd7f32;
  --badge-text-color: white;
}

.compact-achievement-badge.bronze:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: #cd7f32;
  --badge-text-color: var(--color-text-mute);
  opacity: 0.7;
  border-left: 3px solid #cd7f32;
}

.compact-achievement-badge.silver {
  --badge-background: linear-gradient(135deg, 
    #708090 0%, 
    #c0c0c0 25%, 
    #e8e8e8 50%, 
    #c0c0c0 75%, 
    #708090 100%);
  --badge-border: #c0c0c0;
  --badge-text-color: #2c2c2c;
}

.compact-achievement-badge.silver:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: #c0c0c0;
  --badge-text-color: var(--color-text-mute);
  opacity: 0.7;
  border-left: 3px solid #c0c0c0;
}

.compact-achievement-badge.gold {
  --badge-background: linear-gradient(135deg, 
    #b8860b 0%, 
    #ffd700 25%, 
    #ffef94 50%, 
    #ffd700 75%, 
    #b8860b 100%);
  --badge-border: #ffd700;
  --badge-text-color: #2c2c2c;
}

.compact-achievement-badge.gold:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: var(--color-border);
  --badge-text-color: var(--color-text-mute);
  opacity: 0.7;
  border-left: 3px solid #ffd700;
}

.compact-achievement-badge.diamond {
  --badge-background: linear-gradient(135deg, 
    #4169e1 0%, 
    #87ceeb 25%, 
    #f0f8ff 50%, 
    #87ceeb 75%, 
    #4169e1 100%);
  --badge-border: #87ceeb;
  --badge-text-color: #2c2c2c;
}

.compact-achievement-badge.diamond:not(.earned) {
  --badge-background: var(--color-background-mute);
  --badge-border: var(--color-border);
  --badge-text-color: var(--color-text-mute);
  opacity: 0.7;
  border-left: 3px solid #87ceeb;
}

/* Shimmer effect for earned badges */
.compact-achievement-badge.earned::after {
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

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Improved contrast for unachieved badges in dark mode */
[data-theme="dark"] .compact-achievement-badge:not(.earned) {
  --badge-text-color: rgba(255, 255, 255, 0.9);
  opacity: 0.85;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .compact-achievement-badge:not(.earned) {
    --badge-text-color: rgba(255, 255, 255, 0.9);
    opacity: 0.85;
  }
}

.badge-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.badge-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--badge-text-color);
  line-height: 1.2;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--badge-text-color);
  opacity: 0.8;
}

.earned-date-indicator {
  flex-shrink: 0;
  color: var(--badge-text-color);
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  min-width: 50px;
}

.tier-indicator {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.tier-indicator.bronze {
  background: linear-gradient(135deg, #8b4513, #cd7f32);
  color: white;
  box-shadow: 0 1px 3px rgba(139, 69, 19, 0.3);
}

.tier-indicator.silver {
  background: linear-gradient(135deg, #708090, #c0c0c0);
  color: #2c2c2c;
  box-shadow: 0 1px 3px rgba(112, 128, 144, 0.3);
}

.tier-indicator.gold {
  background: linear-gradient(135deg, #b8860b, #ffd700);
  color: #2c2c2c;
  box-shadow: 0 1px 3px rgba(184, 134, 11, 0.3);
}

.tier-indicator.diamond {
  background: linear-gradient(135deg, #4169e1, #87ceeb);
  color: white;
  box-shadow: 0 1px 3px rgba(65, 105, 225, 0.3);
}

.tier-text {
  font-size: 0.65rem;
}

.compact-achievement-badge.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.compact-achievement-badge.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.2),
    0 3px 6px rgba(0, 0, 0, 0.15);
}

.compact-achievement-badge.clickable:active {
  transform: translateY(-1px);
}


/* Hover effects */
.compact-achievement-badge.earned:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .compact-achievement-badge {
    padding: 0.6rem 0.8rem;
    gap: 0.6rem;
    min-height: 50px;
  }
  
  .badge-title {
    font-size: 1.2rem;
  }
  
  .progress-text {
    font-size: 0.8rem;
  }
}
</style>
