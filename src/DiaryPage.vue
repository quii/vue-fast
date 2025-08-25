<template>
  <div class="diary-page">
    <BaseTopBar
      v-if="timelineItems.length > 0"
      :action-buttons="filterButtons"
      alignment="spread"
      @action="handleFilterAction"
    />
    
    <div v-if="filteredTimelineItems.length > 0" class="diary-view">
      <div class="timeline-container">
        <!-- Enhanced timeline items (notes, achievements, venues, and PBs) -->
        <template v-for="item in filteredTimelineItems" :key="`${item.type}-${item.shootId || item.achievement?.id || item.date}`">
          
          <!-- Achievement entries -->
          <AchievementDiaryEntry
            v-if="item.type === 'achievement' && item.achievement && item.achievement.name && item.achievement.tier && item.achievement.achievedDate"
            :title="item.achievement.name"
            :description="item.achievement.description || ''"
            :tier="item.achievement.tier"
            :achieved-date="item.achievement.achievedDate"
            :achieving-shoot-id="item.achievement.achievingShootId"
          />
          
          <!-- New venue entries -->
          <VenueDiaryEntry
            v-else-if="item.type === 'new-venue' && item.location && item.shoot"
            :date="item.date"
            :location="item.location"
            :shoot="item.shoot"
            :is-first-ever="item.isFirstEver"
            :show-map="true"
          />
          
          <!-- Personal best entries -->
          <PersonalBestDiaryEntry
            v-else-if="(item.type === 'personal-best' || item.type === 'first-time-round') && item.shoot"
            :date="item.date"
            :game-type="item.gameType"
            :score="item.score"
            :previous-best="item.previousBest"
            :is-first-time-round="item.type === 'first-time-round'"
            :shoot="item.shoot"
          />
          
          <!-- Note entries -->
          <article
            v-else-if="item.type === 'note' && item.shoot"
            class="diary-entry"
            @click="view(item.shoot.id)"
          >
            <div class="note-content">
              <div class="note-header">
                <h4 class="note-title">Session Notes</h4>
                <time class="note-date">{{ formatShootDate(item.shoot.date) }}</time>
              </div>
              <HistoryCard :item="item.shoot" />
              <UserNotes :shoot-id="item.shoot.id" />
            </div>
          </article>
          
        </template>
      </div>
    </div>

    <div v-else-if="timelineItems.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      </div>
      <h2>No diary entries yet</h2>
      <p>Add notes to your shoots to see them here.</p>

      <div class="instruction-box">
        <h3>How to add notes:</h3>
        <ol>
          <li>While scoring, tap the <strong>Note</strong> button in the top bar
            <div class="button-example">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Note</span>
            </div>
          </li>
          <li>Enter your observations, thoughts, or reminders</li>
          <li>Your notes will appear here in your diary</li>
        </ol>
        <p class="tip">Tip: Notes are great for tracking form issues, equipment changes, or weather conditions!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import HistoryCard from '@/components/HistoryCard.vue'
import UserNotes from '@/components/UserNotes.vue'
import AchievementDiaryEntry from '@/components/AchievementDiaryEntry.vue'
import VenueDiaryEntry from '@/components/VenueDiaryEntry.vue'
import PersonalBestDiaryEntry from '@/components/PersonalBestDiaryEntry.vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import { useHistoryStore } from '@/stores/history'
import { useNotesStore } from '@/stores/user_notes'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDiaryAchievements } from '@/domain/achievements/diary_achievements'
import { createEnhancedDiaryTimeline } from '@/domain/diary/enhanced_diary_timeline'

// Import icons for filter buttons
import NoteIcon from '@/components/icons/NoteIcon.vue'
import ClassificationIcon from '@/components/icons/ClassificationIcon.vue'
import MapIcon from '@/components/icons/MapIcon.vue'
import PersonalBestIcon from '@/components/icons/PersonalBestIcon.vue'
import ResetIcon from '@/components/icons/ResetIcon.vue'

const router = useRouter()
const historyStore = useHistoryStore()
const notesStore = useNotesStore()

// Get all shoots that have notes
const shootsWithNotes = computed(() =>
  historyStore.sortedHistory().filter(shoot =>
    notesStore.getNotesByShootId(shoot.id).length > 0
  )
)

// Get all earned achievements for diary display
const diaryAchievements = computed(() =>
  getDiaryAchievements(historyStore.sortedHistory())
)

// Create enhanced timeline of notes, achievements, venues, and personal bests
const timelineItems = computed(() =>
  createEnhancedDiaryTimeline(shootsWithNotes.value, diaryAchievements.value, historyStore.sortedHistory())
)

// Filter state
const activeFilters = ref(new Set())

// Filter buttons configuration
const filterButtons = computed(() => [
  {
    iconComponent: NoteIcon,
    label: 'Notes',
    action: 'notes',
    active: activeFilters.value.has('note'),
    disabled: false
  },
  {
    iconComponent: ClassificationIcon,
    label: 'Awards',
    action: 'awards',
    active: activeFilters.value.has('achievement'),
    disabled: false
  },
  {
    iconComponent: MapIcon,
    label: 'Venues',
    action: 'venues',
    active: activeFilters.value.has('new-venue'),
    disabled: false
  },
  {
    iconComponent: PersonalBestIcon,
    label: 'PBs',
    action: 'pbs',
    active: activeFilters.value.has('personal-best') || activeFilters.value.has('first-time-round'),
    disabled: false
  },
  {
    iconComponent: ResetIcon,
    label: 'Reset',
    action: 'reset',
    active: false,
    disabled: activeFilters.value.size === 0
  }
])

// Filtered timeline items
const filteredTimelineItems = computed(() => {
  if (activeFilters.value.size === 0) {
    return timelineItems.value
  }
  
  return timelineItems.value.filter(item => {
    if (activeFilters.value.has(item.type)) {
      return true
    }
    
    // Special handling for PB filter (includes both personal-best and first-time-round)
    if ((activeFilters.value.has('personal-best') || activeFilters.value.has('first-time-round')) && 
        (item.type === 'personal-best' || item.type === 'first-time-round')) {
      return true
    }
    
    return false
  })
})

function view(id) {
  router.push({ name: 'viewHistory', params: { id } })
}

function formatShootDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })
}

function handleFilterAction({ action }) {
  switch (action) {
    case 'notes':
      toggleFilter('note')
      break
    case 'awards':
      toggleFilter('achievement')
      break
    case 'venues':
      toggleFilter('new-venue')
      break
    case 'pbs':
      togglePBFilter()
      break
    case 'reset':
      activeFilters.value.clear()
      break
  }
}

function toggleFilter(filterType) {
  if (activeFilters.value.has(filterType)) {
    activeFilters.value.delete(filterType)
  } else {
    activeFilters.value.add(filterType)
  }
  // Force reactivity update
  activeFilters.value = new Set(activeFilters.value)
}

function togglePBFilter() {
  const hasPBFilter = activeFilters.value.has('personal-best') || activeFilters.value.has('first-time-round')
  
  if (hasPBFilter) {
    activeFilters.value.delete('personal-best')
    activeFilters.value.delete('first-time-round')
  } else {
    activeFilters.value.add('personal-best')
    activeFilters.value.add('first-time-round')
  }
  // Force reactivity update
  activeFilters.value = new Set(activeFilters.value)
}
</script>

<style scoped>
.diary-page {
  padding: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* Note entries */
.diary-entry {
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.diary-entry:hover {
  transform: translateY(-1px);
}

.note-content {
  background: color-mix(in srgb, var(--color-background-soft) 90%, #9E9E9E 10%);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
}

.note-title {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1rem;
  margin: 0;
}

.note-date {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-light);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  margin-bottom: 1rem;
  color: var(--color-text-light);
  opacity: 0.7;
}

.empty-state h2 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.instruction-box {
  margin-top: 2rem;
  background-color: var(--color-background-soft, #f5f5f5);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.instruction-box h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.instruction-box ol {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.instruction-box li {
  margin-bottom: 0.75rem;
}

.button-example {
  display: inline-flex;
  align-items: center;
  background-color: var(--color-background-mute, #eaeaea);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-weight: 500;
}

.button-example svg {
  margin-right: 0.5rem;
}

.tip {
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: var(--color-text);
}
</style>