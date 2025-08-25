<template>
  <div class="pb-diary-entry">
    <div class="pb-content" :class="{ 'first-time': isFirstTimeRound }">
      <div class="pb-header">
        <h3 class="pb-milestone" :class="{ 'first-time': isFirstTimeRound }">
          <PersonalBestIcon class="pb-icon" />
          {{ getMilestoneTitle() }}
        </h3>
        <time class="pb-date">{{ formatDate(date) }}</time>
      </div>
      
      <!-- Just show the associated shoot card -->
      <HistoryCard :item="shoot" />
    </div>
  </div>
</template>

<script setup>
import PersonalBestIcon from '@/components/icons/PersonalBestIcon.vue'
import HistoryCard from '@/components/HistoryCard.vue'

const props = defineProps({
  date: {
    type: String,
    required: true
  },
  gameType: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  previousBest: {
    type: Number,
    default: null
  },
  isFirstTimeRound: {
    type: Boolean,
    default: false
  },
  shoot: {
    type: Object,
    required: true
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

function getMilestoneTitle() {
  if (props.isFirstTimeRound) {
    return 'First time shooting!'
  }
  
  if (props.previousBest) {
    const improvement = props.score - props.previousBest
    return `New personal best (+${improvement})`
  }
  
  return 'New personal best!'
}
</script>

<style scoped>
.pb-diary-entry {
  margin-bottom: 0;
}

.pb-content {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.75rem;
}


.pb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
}

.pb-milestone {
  color: #FF9800;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pb-milestone.first-time {
  color: #4CAF50;
}

.pb-icon {
  width: 1rem;
  height: 1rem;
}

.pb-date {
  font-size: 0.85rem;
  color: var(--color-text-light, #666);
  font-style: italic;
}

/* Responsive design */
@media (max-width: 640px) {
  .pb-diary-entry {
    margin-bottom: 1.25rem;
  }
  
  .pb-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .pb-milestone {
    font-size: 0.9rem;
  }
}
</style>