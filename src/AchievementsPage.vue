<template>
  <div class="achievements-page">
    <div class="content">
      <AchievementsIcon class="achievement-icon" />
      <h1>Awards</h1>
      <p class="description">
        Track your archery progress and complete awards based on your performance.
      </p>
      
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="achievement-card"
        :class="{ completed: achievement.progress.isUnlocked }"
      >
        <div class="achievement-header">
          <div class="achievement-title">{{ achievement.name }}</div>
        </div>
        
        <div class="achievement-description">
          {{ achievement.description }}
        </div>
        
        <div class="progress-section">
          <div class="progress-text">
            {{ achievement.progress.totalArrows.toLocaleString() }} / {{ achievement.progress.targetArrows.toLocaleString() }} arrows
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: achievement.progressPercentage + '%' }"
            ></div>
          </div>
          <div class="progress-percentage">
            {{ Math.round(achievement.progressPercentage) }}% complete
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AchievementsIcon from '@/components/icons/AchievementsIcon.vue'
import { useHistoryStore } from '@/stores/history.js'
import { getAllAchievements } from '@/domain/achievements/registry.js'
import { check10kArrowsAchieved } from '@/domain/achievements/ten_thousand_arrows.js'
import { check25kArrowsAchieved } from '@/domain/achievements/twenty_five_thousand_arrows.js'

const historyStore = useHistoryStore()

const achievements = computed(() => {
  const history = historyStore.sortedHistory()
  const currentShoot = { scores: [] } // No current shoot on this page
  const context = {
    currentShoot,
    shootHistory: history.map(shoot => ({ scores: shoot.scores || [] }))
  }

  const allAchievements = getAllAchievements()
  
  return allAchievements.map(achievement => {
    let progress
    if (achievement.id === 'ten_thousand_arrows') {
      progress = check10kArrowsAchieved(context)
    } else if (achievement.id === 'twenty_five_thousand_arrows') {
      progress = check25kArrowsAchieved(context)
    } else {
      // Default fallback
      progress = { totalArrows: 0, targetArrows: achievement.targetArrows, isUnlocked: false }
    }

    const progressPercentage = Math.min((progress.totalArrows / progress.targetArrows) * 100, 100)

    return {
      ...achievement,
      progress,
      progressPercentage
    }
  })
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

.achievement-card.completed {
  border-color: var(--color-highlight);
  background-color: var(--color-background-mute);
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