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
        <!-- Grouped timeline items by date -->
        <template v-for="dateGroup in groupedTimelineItems" :key="dateGroup.date">
          
          <!-- Date card containing all events for this date -->
          <div class="date-card">
            <div class="date-card-header">
              <time class="date-card-title">{{ formatShootDate(dateGroup.date + 'T00:00:00') }}</time>
            </div>
            
            <!-- Shoots for this date -->
            <div class="date-card-events">
              <template v-for="shootGroup in dateGroup.shoots" :key="shootGroup.shoot?.id || 'no-shoot'">
                  
                <!-- Show HistoryCard once per shoot -->
                <HistoryCard v-if="shootGroup.shoot" :item="shootGroup.shoot" @click="view(shootGroup.shoot.id)" />
                
                <!-- Events that happened during this shoot -->
                <template v-if="shootGroup.events.length > 0" v-for="item in shootGroup.events" :key="`${item.type}-${item.shootId || item.achievement?.id || item.date}`">
                  
                  <!-- Achievement entries -->
                  <div v-if="item.type === 'achievement' && item.achievement" class="event-item achievement-event">
                    <AchievementBadge
                      :title="item.achievement.name"
                      :description="item.achievement.description"
                      :tier="item.achievement.tier"
                      :is-earned="true"
                      :achieving-shoot-id="item.achievement.achievingShootId"
                      :achieved-date="item.achievement.achievedDate"
                      class="compact-badge"
                    />
                  </div>
                  
                  <!-- Personal best entries -->
                  <div v-else-if="item.type === 'personal-best' || item.type === 'first-time-round'" class="event-item pb-event">
                    <div class="event-icon">☆</div>
                    <div class="event-content">
                      <div class="event-title">
                        {{ item.type === 'first-time-round' ? 'First time shooting this round!' : `New personal best (+${item.score - (item.previousBest || 0)})` }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- New venue entries -->
                  <div v-else-if="item.type === 'new-venue'" class="event-item venue-event">
                    <div class="venue-header">
                      <h4 class="venue-title">
                        <MapIcon class="venue-icon" />
                        {{ item.isFirstEver ? 'First location recorded!' : 'Shot at new location!' }}
                      </h4>
                    </div>
                    <div class="venue-details">
                      <div class="coordinate-badge">{{ item.location.latitude.toFixed(4) }}°N</div>
                      <div class="coordinate-badge">{{ item.location.longitude.toFixed(4) }}°W</div>
                      <div class="map-link" @click="openMap(item.location)">
                        <MapIcon />
                        <span>Map</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Session notes -->
                  <UserNotes v-else-if="item.type === 'note'" :shoot-id="item.shoot.id" class="note-event" />
                  
                </template>
                
              </template>
            </div>
          </div>
          
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
import AchievementBadge from '@/components/AchievementBadge.vue'
import BaseTopBar from '@/components/ui/BaseTopBar.vue'
import MapIcon from '@/components/icons/MapIcon.vue'
import { useHistoryStore } from '@/stores/history'
import { useNotesStore } from '@/stores/user_notes'
import { useAchievementStore } from '@/stores/achievements'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDiaryAchievements } from '@/domain/achievements/diary_achievements'
import { createEnhancedDiaryTimeline } from '@/domain/diary/enhanced_diary_timeline'

// Import icons for filter buttons
import NoteIcon from '@/components/icons/NoteIcon.vue'
import ClassificationIcon from '@/components/icons/ClassificationIcon.vue'
import PersonalBestIcon from '@/components/icons/PersonalBestIcon.vue'
import ResetIcon from '@/components/icons/ResetIcon.vue'

const router = useRouter()
const historyStore = useHistoryStore()
const notesStore = useNotesStore()
const achievementStore = useAchievementStore()

// Get all shoots that have notes
const shootsWithNotes = computed(() =>
  historyStore.sortedHistory().filter(shoot =>
    notesStore.getNotesByShootId(shoot.id).length > 0
  )
)

// Get all earned achievements for diary display using centralized service
const diaryAchievements = computed(() => {
  const history = historyStore.sortedHistory()
  const context = {
    currentShoot: { scores: [], id: '', date: '', gameType: '', userProfile: {} }, // Empty current shoot (same as AchievementsPage)
    shootHistory: history
  }
  
  const allAchievements = achievementStore.getAllAchievements(context)
  return getDiaryAchievements(allAchievements)
})

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

// Group timeline items by date, then by shoot within each date
const groupedTimelineItems = computed(() => {
  const dateGroups = new Map()
  const allShoots = historyStore.sortedHistory()
  
  filteredTimelineItems.value.forEach(item => {
    // Extract date only (YYYY-MM-DD format)
    const date = item.date.split('T')[0]
    
    if (!dateGroups.has(date)) {
      dateGroups.set(date, new Map())
    }
    
    const shootGroups = dateGroups.get(date)
    
    // Determine shootId for grouping
    let shootId = null
    let shoot = null
    
    if (item.shoot) {
      // Notes, PBs, venues have direct shoot reference
      shootId = item.shoot.id
      shoot = item.shoot
    } else if (item.achievement?.achievingShootId) {
      // Achievements reference shoot by ID
      shootId = item.achievement.achievingShootId
      shoot = allShoots.find(s => s.id === shootId)
    }
    
    if (shootId && shoot) {
      if (!shootGroups.has(shootId)) {
        shootGroups.set(shootId, {
          shoot: shoot,
          events: []
        })
      }
      shootGroups.get(shootId).events.push(item)
    } else {
      // Handle events without associated shoots (shouldn't happen, but fallback)
      const fallbackKey = 'no-shoot'
      if (!shootGroups.has(fallbackKey)) {
        shootGroups.set(fallbackKey, {
          shoot: null,
          events: []
        })
      }
      shootGroups.get(fallbackKey).events.push(item)
    }
  })
  
  // Convert to array and sort by date (most recent first)
  return Array.from(dateGroups.entries())
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .map(([date, shootGroups]) => ({
      date,
      shoots: Array.from(shootGroups.values())
        .sort((a, b) => {
          // Sort shoots within the same date by time
          if (a.shoot && b.shoot) {
            return new Date(b.shoot.date).getTime() - new Date(a.shoot.date).getTime()
          }
          return 0
        })
        .map(shootGroup => ({
          ...shootGroup,
          events: shootGroup.events.sort((a, b) => {
            // Sort events within the same shoot by type priority
            const typePriority = {
              'achievement': 1,
              'personal-best': 2, 
              'first-time-round': 3,
              'new-venue': 4,
              'note': 5
            }
            return (typePriority[a.type] || 999) - (typePriority[b.type] || 999)
          })
        }))
    }))
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

function openMap(location) {
  const url = `https://maps.apple.com/?q=${location.latitude},${location.longitude}`
  window.open(url, '_blank')
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

/* Date card grouping */
.date-card {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.date-card:first-child {
  margin-top: 0;
}

.date-card-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

.date-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  display: block;
}

.date-card-events {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Removed shoot session wrapper - components display directly */

/* Event items */
.event-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: var(--color-background-soft);
  border-radius: 4px;
}

.event-item:last-child {
  margin-bottom: 0;
}

/* Achievement events use full width for badge */
.achievement-event {
  padding: 0;
  background: none;
}

.achievement-event .compact-badge {
  margin: 0;
}

.achievement-event :deep(.achievement-badge) {
  margin: 0;
  box-shadow: none;
}

/* Non-achievement events use flex layout */
.pb-event {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.venue-event {
  display: block;
}

/* Event type specific backgrounds */
.pb-event {
  background: color-mix(in srgb, var(--color-background-soft) 85%, #FF9800 15%);
}

.venue-event {
  background: color-mix(in srgb, var(--color-background-soft) 85%, #2196F3 15%);
  padding: 0.75rem;
}

.venue-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
}

.venue-title {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.venue-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.venue-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.coordinate-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--color-background-mute);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  font-family: monospace;
  white-space: nowrap;
  flex-shrink: 0;
}

.map-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-background-mute);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  white-space: nowrap;
  flex-shrink: 0;
}

.map-link:hover {
  background: var(--color-border-hover);
}

.map-link svg {
  width: 0.875rem;
  height: 0.875rem;
}

.note-event {
  display: block;
  margin-top: -0.25rem;
}

.event-icon {
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
  flex-shrink: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.3;
}

.event-description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.2;
  margin-top: 0.2rem;
}

/* Event type specific styling - removed left borders */

/* Removed old shoot-session CSS references */

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