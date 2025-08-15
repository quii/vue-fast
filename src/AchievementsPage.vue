<template>
  <div class="achievements-page">
    <div class="content">
      <AchievementsIcon class="achievement-icon" />
      <h1>Awards</h1>
      <p class="description">
        Track your archery progress and complete awards based on your performance.
      </p>
      
      <div class="achievement-card">
        <div class="achievement-header">
          <div class="achievement-title">{{ achievementInfo.name }}</div>
        </div>
        
        <div class="achievement-description">
          {{ achievementInfo.description }}
        </div>
        
        <div class="progress-section">
          <div class="progress-text">
            {{ progress.totalArrows.toLocaleString() }} / {{ progress.targetArrows.toLocaleString() }} arrows
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
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AchievementsIcon from '@/components/icons/AchievementsIcon.vue'
import { useAchievementStore } from '@/stores/achievements.js'
import { useHistoryStore } from '@/stores/history.js'

const achievementStore = useAchievementStore()
const historyStore = useHistoryStore()

const achievementInfo = computed(() => achievementStore.getAchievementInfo())
const progress = computed(() => achievementStore.getProgress())

const progressPercentage = computed(() => {
  return Math.min((progress.value.totalArrows / progress.value.targetArrows) * 100, 100)
})

onMounted(() => {
  // Update achievement progress when page loads
  const history = historyStore.sortedHistory()
  const currentShoot = { scores: [] } // No current shoot on this page
  achievementStore.updateProgress(currentShoot, history)
})
</script>

<style scoped>
.achievements-page {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.content {
  text-align: center;
}

.achievement-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  color: var(--color-highlight);
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.description {
  font-size: 1rem;
  color: var(--color-text-mute);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.achievement-card {
  background-color: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  text-align: left;
  border: 2px solid var(--color-border);
}

.achievement-header {
  margin-bottom: 1rem;
}

.achievement-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-text);
}

.achievement-description {
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.progress-section {
  margin-top: 1rem;
}

.progress-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.progress-bar {
  background-color: var(--color-background-mute);
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background-color: var(--color-highlight);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.progress-percentage {
  font-size: 0.9rem;
  color: var(--color-text-mute);
  text-align: right;
}
</style>