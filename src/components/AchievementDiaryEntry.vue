<template>
  <div class="achievement-diary-entry">
    <div class="achievement-content">
      <div class="achievement-header">
        <h3 class="achievement-milestone">Achievement Unlocked!</h3>
        <time v-if="!hideDate" class="achievement-date">{{ formatDate(achievedDate) }}</time>
      </div>
      
      <!-- Reuse the existing AchievementBadge component -->
      <AchievementBadge
        :title="title"
        :description="description"
        :tier="tier"
        :is-earned="true"
        :achieving-shoot-id="achievingShootId"
        :achieved-date="achievedDate"
        class="diary-badge"
      />
    </div>
  </div>
</template>

<script setup>
import AchievementBadge from '@/components/AchievementBadge.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tier: {
    type: String,
    required: true
  },
  achievedDate: {
    type: String,
    required: true
  },
  achievingShootId: {
    type: [Number, String],
    default: null
  },
  hideDate: {
    type: Boolean,
    default: false
  }
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })
}
</script>

<style scoped>
.achievement-diary-entry {
  margin-bottom: 0;
}

.achievement-content {
  background: color-mix(in srgb, var(--color-background-soft) 85%, #ffd700 15%);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.75rem;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
}

.achievement-milestone {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.achievement-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  font-style: italic;
}

.diary-badge {
  margin-bottom: 0;
}

/* Responsive design */
@media (max-width: 640px) {
  .achievement-diary-entry {
    margin-bottom: 0;
  }
  
  .achievement-content {
    padding: 1rem;
  }
  
  .achievement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .achievement-milestone {
    font-size: 1rem;
  }
  
  .achievement-date {
    font-size: 0.85rem;
  }
}
</style>