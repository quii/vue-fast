<template>
  <div class="page">
    <BaseTopBar
      :infoDisplays="filterButtons"
      @action="handleFilterAction"
    />
    
    <div class="content">
      <div 
        v-for="achievement in filteredAchievements" 
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
            <span v-if="achievement.targetArrows">
              {{ achievement.progress.totalArrows.toLocaleString() }} / {{ achievement.progress.targetArrows.toLocaleString() }} arrows
            </span>
            <span v-else-if="achievement.targetScore">
              {{ achievement.progress.currentScore || 0 }} / {{ achievement.progress.targetScore }} points on {{ achievement.gameType?.toUpperCase() }}
            </span>
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
import { computed, ref } from 'vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import { useHistoryStore } from '@/stores/history.js'
import { getAllAchievements } from '@/domain/achievements/registry.js'
import { check1kArrowsAchieved } from '@/domain/achievements/one_thousand_arrows.js'
import { check10kArrowsAchieved } from '@/domain/achievements/ten_thousand_arrows.js'
import { check25kArrowsAchieved } from '@/domain/achievements/twenty_five_thousand_arrows.js'
import { check600AtWA70Achieved } from '@/domain/achievements/six_hundred_at_wa70.js'

const historyStore = useHistoryStore()

const currentFilter = ref('all')

const filterButtons = computed(() => {
  const allAchievements = achievements.value
  const achievedCount = allAchievements.filter(a => a.progress.isUnlocked).length
  const unearnedCount = allAchievements.filter(a => !a.progress.isUnlocked).length
  const totalCount = allAchievements.length
  
  return [
    { 
      value: totalCount, 
      label: 'All', 
      action: 'filter-all', 
      active: currentFilter.value === 'all' 
    },
    { 
      value: achievedCount, 
      label: 'Achieved', 
      action: 'filter-achieved', 
      active: currentFilter.value === 'achieved' 
    },
    { 
      value: unearnedCount, 
      label: 'Unearned', 
      action: 'filter-unearned', 
      active: currentFilter.value === 'unearned' 
    }
  ]
})

function handleFilterAction({ action }) {
  if (action === 'filter-all') {
    currentFilter.value = 'all'
  } else if (action === 'filter-achieved') {
    currentFilter.value = 'achieved'
  } else if (action === 'filter-unearned') {
    currentFilter.value = 'unearned'
  }
}

const achievements = computed(() => {
  const history = historyStore.sortedHistory()
  const currentShoot = { scores: [] } // No current shoot on this page
  const context = {
    currentShoot,
    shootHistory: history.map(shoot => ({ 
      scores: shoot.scores || [], 
      score: shoot.score || 0,
      gameType: shoot.gameType || ''
    }))
  }

  const allAchievements = getAllAchievements()
  
  return allAchievements.map(achievement => {
    let progress
    let progressPercentage = 0
    
    // Call the appropriate achievement function
    if (achievement.id === 'one_thousand_arrows') {
      progress = check1kArrowsAchieved(context)
      progressPercentage = Math.min((progress.totalArrows / progress.targetArrows) * 100, 100)
    } else if (achievement.id === 'ten_thousand_arrows') {
      progress = check10kArrowsAchieved(context)
      progressPercentage = Math.min((progress.totalArrows / progress.targetArrows) * 100, 100)
    } else if (achievement.id === 'twenty_five_thousand_arrows') {
      progress = check25kArrowsAchieved(context)
      progressPercentage = Math.min((progress.totalArrows / progress.targetArrows) * 100, 100)
    } else if (achievement.id === 'six_hundred_at_wa70') {
      progress = check600AtWA70Achieved(context)
      progressPercentage = progress.isUnlocked ? 100 : Math.min((progress.currentScore / progress.targetScore) * 100, 100)
    } else {
      // Default fallback
      progress = { totalArrows: 0, targetArrows: achievement.targetArrows || 0, isUnlocked: false }
      progressPercentage = 0
    }

    return {
      ...achievement,
      progress,
      progressPercentage
    }
  })
})

const filteredAchievements = computed(() => {
  const allAchievements = achievements.value
  
  if (currentFilter.value === 'achieved') {
    return allAchievements.filter(achievement => achievement.progress.isUnlocked)
  } else if (currentFilter.value === 'unearned') {
    return allAchievements.filter(achievement => !achievement.progress.isUnlocked)
  }
  
  return allAchievements
})
</script>

<style scoped>
.page {
  padding: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.content {
  margin-top: 0.5rem;
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