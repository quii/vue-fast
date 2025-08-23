<template>
  <div class="achievement-group">
    <div class="group-header">
      <h3 class="group-title">{{ group.name }}</h3>
      <p class="group-description">{{ group.description }}</p>
      <div class="group-stats" v-if="currentFilter === 'all'">
        <div 
          v-for="tierProgress in groupProgress.tierProgress" 
          :key="tierProgress.tier"
          class="tier-pill"
          :class="tierProgress.tier"
        >
          {{ tierProgress.earned }} / {{ tierProgress.total }}
        </div>
      </div>
    </div>
    
    <div class="group-content">
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
</template>

<script setup>
import { computed } from 'vue'
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

const groupProgress = computed(() => {
  return calculateGroupProgress(props.achievements)
})

// Keep the old computed properties for backward compatibility if needed
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
.achievement-group {
  margin-bottom: 2rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.achievement-group:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.12);
}

.group-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

.group-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.group-description {
  font-size: 0.95rem;
  color: var(--color-text-mute);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.group-stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tier-pill {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid transparent;
  min-width: 50px;
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

.group-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .achievement-group {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .group-title {
    font-size: 1.3rem;
  }
  
  .group-description {
    font-size: 0.9rem;
  }
  
  .group-stats {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
