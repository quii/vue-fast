<template>
  <div class="collapsible-achievement-group">
    <div class="group-header" @click="toggleExpanded">
      <div class="header-content">
        <h3 class="group-title">{{ group.name }}</h3>
        <div class="group-stats">
          <div 
            v-if="currentFilter === 'all'" 
            class="tier-pills"
          >
            <div 
              v-for="tierProgress in groupProgress.tierProgress" 
              :key="tierProgress.tier"
              class="tier-pill"
              :class="tierProgress.tier"
            >
              {{ tierProgress.earned }}/{{ tierProgress.total }}
            </div>
          </div>
        </div>
      </div>
      <div class="expand-icon" :class="{ expanded: isExpanded }">
        ❯
      </div>
    </div>
    
    <div v-if="isExpanded" class="group-content">
      <p class="group-description">{{ group.description }}</p>
      <div class="achievements-grid">
        <CompactAchievementBadge
          v-for="achievement in achievements" 
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CompactAchievementBadge from './CompactAchievementBadge.vue'
import { calculateGroupProgress } from '@/domain/achievements/group_progress.js'

const props = defineProps({
  group: {
    type: Object,
    required: true
  },
  achievements: {
    type: Array,
    required: true
  },
  currentFilter: {
    type: String,
    default: 'all'
  }
})

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const groupProgress = computed(() => {
  return calculateGroupProgress(props.achievements)
})

const earnedCount = computed(() => {
  return groupProgress.value.totalEarned
})

const totalCount = computed(() => {
  return groupProgress.value.totalAchievements
})

function getUnitType(achievementId) {
  // Windsor achievements count shoots, not arrows
  if (achievementId.startsWith('for_the_windsor')) {
    return 'shoots';
  }
  return 'arrows';
}
</script>

<style scoped>
.collapsible-achievement-group {
  margin-bottom: 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.group-header {
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  transition: all 0.2s ease;
  user-select: none;
  min-height: 60px;
}

.group-header:hover {
  background: var(--color-background-mute);
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-right: 1rem;
}

.group-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
}

.group-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}


.tier-pills {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tier-pill {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid transparent;
  min-width: 35px;
  text-align: center;
}

.tier-pill.bronze {
  background: linear-gradient(135deg, #8b4513, #cd7f32);
  color: white;
  border-color: #cd7f32;
}

.tier-pill.silver {
  background: linear-gradient(135deg, #708090, #c0c0c0);
  color: #2c2c2c;
  border-color: #c0c0c0;
}

.tier-pill.gold {
  background: linear-gradient(135deg, #b8860b, #ffd700);
  color: #2c2c2c;
  border-color: #ffd700;
}

.tier-pill.diamond {
  background: linear-gradient(135deg, #4169e1, #87ceeb);
  color: #2c2c2c;
  border-color: #87ceeb;
}

.expand-icon {
  font-size: 1.2rem;
  color: var(--color-text-soft);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(0deg);
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.group-header:hover .expand-icon {
  color: var(--color-text);
  background: rgba(0, 0, 0, 0.05);
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

[data-theme="dark"] .group-header:hover .expand-icon {
  background: rgba(255, 255, 255, 0.1);
}

.group-content {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid var(--color-border-light);
  animation: expandContent 0.3s ease;
}

.group-description {
  font-size: 0.9rem;
  color: var(--color-text-mute);
  margin: 1rem 0 1.25rem 0;
  line-height: 1.4;
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@keyframes expandContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .group-header {
    padding: 1rem 1.25rem;
    min-height: 56px;
  }
  
  .group-title {
    font-size: 1.1rem;
  }
  
  
  .tier-pill {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
    min-width: 30px;
  }
  
  .group-content {
    padding: 0 1.25rem 1.25rem;
  }
  
  .header-content {
    gap: 0.4rem;
    margin-right: 0.75rem;
  }
  
  .group-stats {
    gap: 0.75rem;
  }
  
  .expand-icon {
    font-size: 1.1rem;
    min-width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .group-header {
    padding: 0.875rem 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    margin-right: 0.5rem;
  }
  
  .group-stats {
    align-self: stretch;
    justify-content: space-between;
    gap: 0.5rem;
  }
  
  .group-content {
    padding: 0 1rem 1rem;
  }
}
</style>