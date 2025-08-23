<template>
  <div class="achievement-diary-entry">
    <div class="timeline-marker">
      <div class="achievement-icon">🏆</div>
    </div>
    
    <div class="achievement-content">
      <div class="achievement-header">
        <h3 class="achievement-milestone">Achievement Unlocked!</h3>
        <time class="achievement-date">{{ formatDate(achievedDate) }}</time>
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
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
}

/* Timeline connector line */
.achievement-diary-entry:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 14px;
  top: 28px;
  bottom: -1.5rem;
  width: 1px;
  background: linear-gradient(to bottom, 
    var(--color-highlight, #4CAF50), 
    var(--color-highlight, #4CAF50) 70%,
    transparent);
  z-index: 0;
}

.timeline-marker {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffef94);
  border: 2px solid var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.25);
  position: relative;
  z-index: 1;
}

.achievement-icon {
  font-size: 0.9rem;
}

.achievement-content {
  flex: 1;
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Speech bubble pointer */
.achievement-content::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 16px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--color-background-soft);
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
  color: var(--color-highlight, #4CAF50);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, var(--color-highlight, #4CAF50), #66bb6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.achievement-date {
  font-size: 0.85rem;
  color: var(--color-text-light, #666);
  font-style: italic;
}

.diary-badge {
  margin-bottom: 0;
}

/* Dark mode adjustments */
[data-theme="dark"] .timeline-marker {
  border-color: var(--color-background);
}

[data-theme="dark"] .achievement-content::before {
  border-right-color: var(--color-background-soft);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .timeline-marker {
    border-color: var(--color-background);
  }
  
  :root:not([data-theme="light"]) .achievement-content::before {
    border-right-color: var(--color-background-soft);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .achievement-diary-entry {
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  
  .timeline-marker {
    width: 24px;
    height: 24px;
  }
  
  .achievement-icon {
    font-size: 0.8rem;
  }
  
  .achievement-content {
    padding: 0.875rem;
  }
  
  .achievement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }
  
  .achievement-milestone {
    font-size: 1rem;
  }
  
  .achievement-date {
    font-size: 0.8rem;
  }
  
  /* Adjust connector line for mobile */
  .achievement-diary-entry:not(:last-child)::after {
    left: 12px;
    top: 24px;
    bottom: -1.25rem;
  }
  
  /* Adjust speech bubble for mobile */
  .achievement-content::before {
    left: -4px;
    top: 14px;
    border-top-width: 4px;
    border-bottom-width: 4px;
    border-right-width: 4px;
  }
}
</style>