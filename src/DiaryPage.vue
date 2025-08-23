<template>
  <div class="diary-page">
    <div v-if="timelineItems.length > 0" class="diary-view">
      <div class="timeline-container">
        <!-- Timeline items (notes and achievements interwoven) -->
        <template v-for="item in timelineItems" :key="`${item.type}-${item.type === 'note' ? item.shootId : item.achievement?.id}`">
          
          <!-- Achievement entries -->
          <AchievementDiaryEntry
            v-if="item.type === 'achievement' && item.achievement && item.achievement.name && item.achievement.tier && item.achievement.achievedDate"
            :title="item.achievement.name"
            :description="item.achievement.description || ''"
            :tier="item.achievement.tier"
            :achieved-date="item.achievement.achievedDate"
            :achieving-shoot-id="item.achievement.achievingShootId"
          />
          
          <!-- Note entries -->
          <article
            v-else-if="item.type === 'note' && item.shoot"
            class="diary-entry"
            @click="view(item.shoot.id)"
          >
            <div class="note-timeline-marker">
              <div class="note-icon">📝</div>
            </div>
            <div class="note-content">
              <HistoryCard :item="item.shoot" />
              <UserNotes :shoot-id="item.shoot.id" />
            </div>
          </article>
          
        </template>
      </div>
    </div>

    <div v-else-if="shootsWithNotes.length === 0 && diaryAchievements.length === 0" class="empty-state">
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
import { useHistoryStore } from '@/stores/history'
import { useNotesStore } from '@/stores/user_notes'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getDiaryAchievements, createDiaryTimeline } from '@/domain/achievements/diary_achievements'

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

// Create interwoven timeline of notes and achievements
const timelineItems = computed(() =>
  createDiaryTimeline(shootsWithNotes.value, diaryAchievements.value)
)

function view(id) {
  router.push({ name: 'viewHistory', params: { id } })
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

.timeline-container {
  position: relative;
}

/* Note entries in timeline */
.diary-entry {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
}

/* Timeline connector line for note entries */
.diary-entry:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 14px;
  top: 28px;
  bottom: -1.5rem;
  width: 1px;
  background: linear-gradient(to bottom, 
    var(--color-border, rgba(0, 0, 0, 0.2)), 
    var(--color-border, rgba(0, 0, 0, 0.2)) 70%,
    transparent);
  z-index: 0;
}

.note-timeline-marker {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-background-mute);
  border: 2px solid var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.note-icon {
  font-size: 0.9rem;
}

.note-content {
  flex: 1;
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Speech bubble pointer for notes */
.note-content::before {
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