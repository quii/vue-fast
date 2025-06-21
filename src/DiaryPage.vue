<template>
  <div class="diary-page">
    <div v-if="shootsWithNotes.length > 0" class="diary-view">
      <article v-for="shoot in shootsWithNotes"
               :key="shoot.id"
               class="diary-entry"
               @click="view(shoot.id)">
        <HistoryCard :item="shoot" />
        <UserNotes :shoot-id="shoot.id" />
      </article>
    </div>

    <div v-else class="empty-state">
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
import { useHistoryStore } from '@/stores/history'
import { useNotesStore } from '@/stores/user_notes'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const historyStore = useHistoryStore()
const notesStore = useNotesStore()

// Get all shoots that have notes
const shootsWithNotes = computed(() =>
  historyStore.sortedHistory().filter(shoot =>
    notesStore.getNotesByShootId(shoot.id).length > 0
  )
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

.diary-entry {
  margin: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light, rgba(60, 60, 60, 0.1));
}

.diary-entry:last-child {
  border-bottom: none;
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