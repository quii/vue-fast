<template>
  <div class="celebration-overlay" @click="handleOverlayClick">
    <div class="celebration-content" @click.stop>
      <!-- Celebration header -->
      <div class="celebration-header">
        <div class="celebration-icon">🎉</div>
        <h2 class="celebration-title">Achievement Unlocked!</h2>
      </div>

      <!-- Achievement details -->
      <div class="achievement-details">
        <div 
          class="achievement-badge celebration-badge"
          :class="{ 
            'bronze': (achievement?.tier || 'bronze') === 'bronze',
            'silver': (achievement?.tier || 'bronze') === 'silver', 
            'gold': (achievement?.tier || 'bronze') === 'gold',
            'diamond': (achievement?.tier || 'bronze') === 'diamond'
          }"
        >
          <div class="badge-content">
            <div class="badge-title">{{ achievement?.name || 'Achievement' }}</div>
            <div class="badge-description">{{ achievement?.description || 'Achievement unlocked!' }}</div>
          </div>
          
          <!-- Tier indicator -->
          <div class="tier-indicator" :class="achievement?.tier || 'bronze'">
            <span class="tier-text">{{ (achievement?.tier || 'bronze').charAt(0).toUpperCase() + (achievement?.tier || 'bronze').slice(1) }}</span>
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

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
    validator: (value) => {
      if (!value || typeof value !== 'object') {
        console.warn('Achievement prop validation failed: not an object', value);
        return false;
      }
      if (typeof value.name !== 'string' || value.name.length === 0) {
        console.warn('Achievement prop validation failed: invalid name', value);
        return false;
      }
      if (typeof value.description !== 'string' || value.description.length === 0) {
        console.warn('Achievement prop validation failed: invalid description', value);
        return false;
      }
      return true;
    }
  }
})

const emit = defineEmits(['dismiss', 'disable-popups'])

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

.celebration-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: celebrationBounce 1s ease-in-out infinite;
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

.celebration-badge {
  border: 3px solid transparent;
  background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
              linear-gradient(45deg, #FFD700, #FFA500) border-box;
  animation: celebrationGlow 3s ease-in-out infinite;
}

.celebration-badge.bronze {
  background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
              linear-gradient(45deg, #CD7F32, #B87333) border-box;
}

.celebration-badge.silver {
  background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
              linear-gradient(45deg, #C0C0C0, #A8A8A8) border-box;
}

.celebration-badge.gold {
  background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
              linear-gradient(45deg, #FFD700, #FFA500) border-box;
}

.celebration-badge.diamond {
  background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
              linear-gradient(45deg, #B9F2FF, #87CEEB) border-box;
}

/* Inherit achievement badge styles but with celebration enhancements */
.achievement-badge {
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  background-color: var(--color-background-soft);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.badge-content {
  position: relative;
  z-index: 2;
}

.badge-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.badge-description {
  font-size: 0.95rem;
  color: var(--color-text-soft);
  line-height: 1.4;
  margin-bottom: 1rem;
}

.tier-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-indicator.bronze {
  background: linear-gradient(135deg, #CD7F32, #B87333);
  color: white;
}

.tier-indicator.silver {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
  color: #333;
}

.tier-indicator.gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
}

.tier-indicator.diamond {
  background: linear-gradient(135deg, #B9F2FF, #87CEEB);
  color: #333;
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

@keyframes celebrationBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
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