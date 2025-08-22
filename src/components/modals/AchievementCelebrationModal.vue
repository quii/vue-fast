<template>
  <div class="celebration-overlay" @click="handleOverlayClick">
    <div class="celebration-content" @click.stop>
      <!-- Celebration header -->
      <div class="celebration-header">
        <h2 class="celebration-title">{{ modalTitle }}</h2>
      </div>

      <!-- Achievement details -->
      <div class="achievement-details">
        <AchievementBadge
          v-for="achievement in displayedAchievements"
          :key="achievement.id || achievement.name"
          :title="achievement.name || 'Achievement'"
          :description="achievement.description || 'Achievement unlocked!'"
          :tier="achievement.tier || 'bronze'"
          :is-earned="true"
          :achieved-date="achievement.progress?.achievedDate || achievement.achievedDate"
          class="celebration-badge"
        />
        
        <!-- "Plus N more" indicator -->
        <div v-if="hasMoreAchievements" class="extra-achievements">
          <div class="extra-achievements-text">
            Plus {{ extraAchievementsCount }} more achievement{{ extraAchievementsCount !== 1 ? 's' : '' }}!
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="celebration-actions">
        <button 
          class="dismiss-btn"
          @click="handleDismiss"
        >
          Awesome!
        </button>
      </div>

      <!-- Settings link -->
      <div class="celebration-footer">
        <button 
          class="settings-link"
          @click="handleDisablePopups"
        >
          Turn off achievement popups
        </button>
      </div>
    </div>

    <!-- Celebration particles/effects -->
    <div class="celebration-particles">
      <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AchievementBadge from '@/components/AchievementBadge.vue'

const props = defineProps({
  achievements: {
    type: Array,
    required: true,
    validator: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        console.warn('Achievements prop validation failed: not a non-empty array', value);
        return false;
      }
      // Validate each achievement
      return value.every(achievement => {
        if (!achievement || typeof achievement !== 'object') {
          console.warn('Achievement prop validation failed: not an object', achievement);
          return false;
        }
        if (typeof achievement.name !== 'string' || achievement.name.length === 0) {
          console.warn('Achievement prop validation failed: invalid name', achievement);
          return false;
        }
        if (typeof achievement.description !== 'string' || achievement.description.length === 0) {
          console.warn('Achievement prop validation failed: invalid description', achievement);
          return false;
        }
        return true;
      });
    }
  }
})

const emit = defineEmits(['dismiss', 'disable-popups'])

// Computed properties for modal display
const modalTitle = computed(() => {
  if (props.achievements.length === 1) {
    return 'Achievement Unlocked!';
  } else {
    return `${props.achievements.length} Achievements Unlocked!`;
  }
});

const displayedAchievements = computed(() => {
  return props.achievements.slice(0, 4); // Show up to 4 achievements
});

const hasMoreAchievements = computed(() => {
  return props.achievements.length > 4;
});

const extraAchievementsCount = computed(() => {
  return Math.max(0, props.achievements.length - 4);
});

function handleOverlayClick() {
  handleDismiss()
}

function handleDismiss() {
  emit('dismiss')
}

function handleDisablePopups() {
  emit('disable-popups')
  handleDismiss()
}

function getParticleStyle(index) {
  // Generate random positions and animations for celebration particles
  const randomX = Math.random() * 100
  const randomY = Math.random() * 100
  const randomDelay = Math.random() * 2
  const randomDuration = 2 + Math.random() * 3
  
  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  }
}
</script>

<style scoped>
.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 215, 0, 0.2),
    rgba(255, 140, 0, 0.2),
    rgba(0, 0, 0, 0.7)
  );
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: celebrationFadeIn 0.5s ease-out;
}

.celebration-content {
  width: 90vw;
  max-width: 420px;
  background: var(--color-background);
  border-radius: 20px;
  padding: 2rem 1.5rem 1.5rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(255, 215, 0, 0.3);
  color: var(--color-text);
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: celebrationBounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.celebration-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FFD700, #FFA500, #FF6347, #FFD700);
  background-size: 200% 100%;
  animation: celebrationShimmer 2s linear infinite;
}

.celebration-header {
  margin-bottom: 1.5rem;
}


.celebration-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: celebrationPulse 2s ease-in-out infinite;
}

.achievement-details {
  margin-bottom: 2rem;
}

/* Enhanced celebration styling for the achievement badge */
.celebration-badge {
  animation: celebrationGlow 3s ease-in-out infinite;
  margin-bottom: 1rem; /* Space between multiple badges */
}

.celebration-badge:last-of-type {
  margin-bottom: 0; /* Remove margin from last badge when no extra indicator */
}

.extra-achievements {
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 215, 0, 0.1);
  border: 2px dashed rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  animation: celebrationPulse 2s ease-in-out infinite;
}

.extra-achievements-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-heading);
  opacity: 0.9;
}

.celebration-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.dismiss-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  background: linear-gradient(135deg, var(--color-highlight), #357ABD);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.dismiss-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
}

.celebration-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.settings-link {
  background: none;
  border: none;
  color: var(--color-text-soft);
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.settings-link:hover {
  color: var(--color-text);
}

/* Celebration particles */
.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #FFD700;
  border-radius: 50%;
  animation: celebrationFloat 3s ease-in-out infinite;
}

.particle:nth-child(2n) {
  background: #FFA500;
}

.particle:nth-child(3n) {
  background: #FF6347;
}

.particle:nth-child(4n) {
  background: #87CEEB;
}

/* Animations */
@keyframes celebrationFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes celebrationBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(100px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}


@keyframes celebrationPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes celebrationShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes celebrationGlow {
  0%, 100% {
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 20px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 30px rgba(255, 215, 0, 0.5);
  }
}

@keyframes celebrationFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .celebration-content {
    width: 95vw;
    padding: 1.5rem 1rem 1rem;
  }
  
  .celebration-title {
    font-size: 1.3rem;
  }
  
  .dismiss-btn {
    width: 100%;
  }
}
</style>