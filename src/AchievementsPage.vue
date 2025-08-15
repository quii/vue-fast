<template>
  <div class="page">
    <BaseTopBar
      :infoDisplays="filterButtons"
      @action="handleFilterAction"
    />
    
    <div class="content">
      <AchievementBadge
        v-for="achievement in filteredAchievements" 
        :key="achievement.id"
        :title="achievement.name"
        :description="achievement.description"
        :icon-component="getAchievementIcon(achievement.id)"
        :tier="achievement.tier"
        :is-earned="achievement.progress.isUnlocked"
        :progress-percentage="achievement.progressPercentage"
        :target-arrows="achievement.targetArrows"
        :current-arrows="achievement.progress.totalArrows"
        :target-score="achievement.targetScore"
        :current-score="achievement.progress.currentScore"
        :game-type="achievement.gameType"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import AchievementBadge from '@/components/AchievementBadge.vue'
import { useHistoryStore } from '@/stores/history.js'
import { getAllAchievements } from '@/domain/achievements/registry.js'
import { check1kArrowsAchieved } from '@/domain/achievements/one_thousand_arrows.js'
import { check10kArrowsAchieved } from '@/domain/achievements/ten_thousand_arrows.js'
import { check25kArrowsAchieved } from '@/domain/achievements/twenty_five_thousand_arrows.js'
import { check600AtWA70Achieved } from '@/domain/achievements/six_hundred_at_wa70.js'

// Achievement icons
import BeginnerTargetIcon from '@/components/icons/achievements/BeginnerTargetIcon.vue'
import MedalIcon from '@/components/icons/achievements/MedalIcon.vue'
import TrophyIcon from '@/components/icons/achievements/TrophyIcon.vue'
import BullseyeIcon from '@/components/icons/achievements/BullseyeIcon.vue'

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

function getAchievementIcon(achievementId) {
  const iconMap = {
    'one_thousand_arrows': BeginnerTargetIcon,
    'ten_thousand_arrows': MedalIcon,
    'twenty_five_thousand_arrows': TrophyIcon,
    'six_hundred_at_wa70': BullseyeIcon
  }
  return iconMap[achievementId] || BeginnerTargetIcon
}
</script>

<style scoped>
.page {
  padding: 0.5rem;
  max-width: 700px;
  margin: 0 auto;
}

.content {
  margin-top: 0.5rem;
}
</style>