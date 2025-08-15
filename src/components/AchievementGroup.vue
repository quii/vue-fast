<template>
  <div class="achievement-group">
    <div class="group-header">
      <h3 class="group-title">{{ group.name }}</h3>
      <p class="group-description">{{ group.description }}</p>
      <div class="group-stats">
        {{ earnedCount }} / {{ totalCount }} earned
      </div>
    </div>
    
    <div class="group-content">
      <CompactAchievementBadge
        v-for="achievement in achievements" 
        :key="achievement.id"
        :title="achievement.name"
        :tier="achievement.tier"
        :is-earned="achievement.progress.isUnlocked"
        :target-arrows="achievement.targetArrows"
        :current-arrows="achievement.progress.totalArrows"
        :target-score="achievement.targetScore"
        :current-score="achievement.progress.currentScore"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CompactAchievementBadge from './CompactAchievementBadge.vue'

const props = defineProps({
  group: {
    type: Object,
    required: true
  },
  achievements: {
    type: Array,
    required: true
  }
})

const earnedCount = computed(() => {
  return props.achievements.filter(achievement => achievement.progress.isUnlocked).length
})

const totalCount = computed(() => {
  return props.achievements.length
})
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
  display: inline-block;
  background: var(--color-highlight);
  color: var(--color-classification-text-dark);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
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
