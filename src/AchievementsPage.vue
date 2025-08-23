<template>
  <div class="page">
    <BaseTopBar
      :infoDisplays="filterButtons"
      @action="handleFilterAction"
    />
    
    <div class="content">
      <!-- Priority Sections -->
      
      <!-- Close to Completion Section -->
      <div v-if="closeToCompletionAchievements.length > 0" class="priority-section">
        <h2 class="priority-title">Nearly achieved</h2>
        <div class="priority-achievements">
          <CompactAchievementBadge
            v-for="achievement in closeToCompletionAchievements"
            :key="achievement.id"
            :title="achievement.name"
            :description="achievement.description"
            :tier="achievement.tier"
            :is-earned="achievement.progress.isUnlocked"
            :target-arrows="achievement.targetArrows"
            :current-arrows="achievement.progress.totalArrows"
            :target-score="achievement.targetScore"
            :current-score="achievement.progress.currentScore"
            :achieving-shoot-id="achievement.progress.achievingShootId"
            :achieved-date="achievement.progress.achievedDate"
            :unit-type="getUnitType(achievement.id)"
          />
        </div>
      </div>

      <!-- Recent Achievements Section -->
      <div v-if="recentAchievements.length > 0" class="priority-section priority-section-secondary">
        <h2 class="priority-title">Recent Achievements</h2>
        <div class="priority-achievements">
          <CompactAchievementBadge
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            :title="achievement.name"
            :description="achievement.description"
            :tier="achievement.tier"
            :is-earned="true"
            :achieving-shoot-id="achievement.progress.achievingShootId"
            :achieved-date="achievement.progress.achievedDate"
            :unit-type="getUnitType(achievement.id)"
          />
        </div>
      </div>

      <!-- All Achievement Groups Section -->
      <div class="priority-section priority-section-secondary">
        <h2 class="priority-title">All Achievements</h2>
        
        <!-- Collapsible Achievement Groups -->
        <CollapsibleAchievementGroup
          v-for="group in groupedAchievements"
          :key="group.group.id"
          :group="group.group"
          :achievements="group.achievements"
          :current-filter="currentFilter"
        />
        
        <!-- Ungrouped achievements (fallback for achievements without groups) -->
        <CollapsibleAchievementGroup
          v-if="ungroupedAchievements.length > 0"
          :group="{ id: 'other', name: 'Other Achievements', description: 'Miscellaneous achievements' }"
          :achievements="ungroupedAchievements"
          :current-filter="currentFilter"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import CompactAchievementBadge from '@/components/CompactAchievementBadge.vue'
import AchievementGroup from '@/components/AchievementGroup.vue'
import CollapsibleAchievementGroup from '@/components/CollapsibleAchievementGroup.vue'
import { useHistoryStore } from '@/stores/history.js'
import { useAchievementStore } from '@/stores/achievements.js'
import { calculateAchievements } from '@/domain/achievements/calculator.js'

const historyStore = useHistoryStore()
const achievementStore = useAchievementStore()

const currentFilter = ref('all')

// Configuration for "Close to Completion" count (easily changeable)
const CLOSE_TO_COMPLETION_COUNT = 3
const RECENT_ACHIEVEMENTS_COUNT = 3

// Mark all achievements as read when the page is visited
onMounted(() => {
  achievementStore.markAllAsRead()
})

const achievements = computed(() => {
  const history = historyStore.sortedHistory()
  const context = {
    currentShoot: { scores: [], id: '', date: '', gameType: '', userProfile: {} }, // Empty current shoot
    shootHistory: history // Use full HistoryItem objects directly
  }

  return calculateAchievements(context)
})

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

const filteredAchievements = computed(() => {
  const allAchievements = achievements.value
  
  if (currentFilter.value === 'achieved') {
    return allAchievements.filter(achievement => achievement.progress.isUnlocked)
  } else if (currentFilter.value === 'unearned') {
    return allAchievements.filter(achievement => !achievement.progress.isUnlocked)
  }
  
  return allAchievements
})

// Group achievements by their group property
const groupedAchievements = computed(() => {
  const filtered = filteredAchievements.value
  const grouped = new Map()
  
  // Group achievements that have a group property
  filtered.forEach(achievement => {
    if (achievement.group) {
      const groupId = achievement.group.id
      if (!grouped.has(groupId)) {
        grouped.set(groupId, {
          group: achievement.group,
          achievements: []
        })
      }
      grouped.get(groupId).achievements.push(achievement)
    }
  })
  
  // Convert Map to array and sort by group order if available
  return Array.from(grouped.values()).sort((a, b) => {
    return (a.group.order || 0) - (b.group.order || 0)
  })
})

// Achievements without groups (fallback)
const ungroupedAchievements = computed(() => {
  return filteredAchievements.value.filter(achievement => !achievement.group)
})

// Priority Section: Close to Completion
const closeToCompletionAchievements = computed(() => {
  if (currentFilter.value !== 'all') return []
  
  return achievements.value
    .filter(achievement => !achievement.progress.isUnlocked && achievement.progressPercentage > 0)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, CLOSE_TO_COMPLETION_COUNT)
})

// Priority Section: Recent Achievements  
const recentAchievements = computed(() => {
  if (currentFilter.value !== 'all') return []
  
  return achievements.value
    .filter(achievement => achievement.progress.isUnlocked && achievement.progress.achievedDate)
    .sort((a, b) => {
      const dateA = new Date(a.progress.achievedDate)
      const dateB = new Date(b.progress.achievedDate)
      return dateB - dateA
    })
    .slice(0, RECENT_ACHIEVEMENTS_COUNT)
})

function getUnitType(achievementId) {
  // Windsor and Gert Lush achievements count shoots, not arrows
  if (achievementId.startsWith('for_the_windsor') || achievementId.startsWith('gert_lush')) {
    return 'shoots';
  }
  return 'arrows';
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

.priority-section {
  margin-bottom: 2.5rem;
}

.priority-section-secondary {
  margin-bottom: 2.5rem;
  margin-top: -1rem;
}

.priority-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 1.25rem 0;
  padding-left: 0.25rem;
  line-height: 1.2;
}

.priority-achievements {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.ungrouped-section {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}



/* Premium Achievement Page Styling - Override BaseTopBar */
.page :deep(.filters-container) {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  margin-bottom: 1rem;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.08);
  position: relative;
}

.page :deep(.filters-container::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.8), 
    transparent);
}

.page :deep(.filters) {
  padding: 1rem;
  gap: 0.75rem;
}

.page :deep(.filter-button), 
.page :deep(.info-display) {
  min-width: 100px;
  height: 55px;
  border-radius: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 1rem;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  color: var(--color-text);
}

.page :deep(.filter-button::before), 
.page :deep(.info-display::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.9), 
    transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.page :deep(.filter-button:hover) {
  transform: translateY(-1px);
  background: var(--color-background-mute);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.12);
}

.page :deep(.filter-button:hover::before),
.page :deep(.info-display.clickable:hover::before) {
  opacity: 1;
}

.page :deep(.filter-button.active), 
.page :deep(.info-display.active) {
  background: var(--color-highlight);
  color: var(--color-classification-text-dark);
  border-color: var(--color-highlight);
  box-shadow: 
    0 4px 12px rgba(74, 144, 226, 0.3),
    0 2px 6px rgba(53, 122, 189, 0.2);
}

.page :deep(.filter-button.active::after), 
.page :deep(.info-display.active::after) {
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
  animation: topBarShimmer 2s infinite;
  border-radius: inherit;
  pointer-events: none;
}

@keyframes topBarShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.page :deep(.info-value) {
  font-weight: 700;
  font-size: 1.1rem;
}

.page :deep(.info-label), 
.page :deep(.filter-label) {
  font-weight: 600;
  font-size: 0.85rem;
}

/* Responsive adjustments for premium styling */
@media (min-width: 768px) {
  .page :deep(.filter-button), 
  .page :deep(.info-display) {
    min-width: 110px;
    height: 60px;
  }
  
  .page :deep(.filters) {
    gap: 1rem;
  }
}
</style>