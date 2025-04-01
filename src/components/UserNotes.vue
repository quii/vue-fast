<script setup>
import { computed } from "vue";
import { useNotesStore } from "@/stores/user_notes";

const props = defineProps({
  shootId: {
    required: false,
    default: null
  },
  allowHighlight: {
    type: Boolean,
    default: false
  }
});

const notesStore = useNotesStore();
const notes = computed(() =>
  props.shootId ? notesStore.getNotesByShootId(props.shootId) : notesStore.pendingNotes
);

const vTouchHold = {
  mounted: (el, binding) => {
    let timer = null;

    el.addEventListener("touchstart", () => {
      timer = setTimeout(() => {
        binding.value();
      }, 500);
    });

    el.addEventListener("touchend", () => {
      clearTimeout(timer);
    });

    el.addEventListener("touchmove", () => {
      clearTimeout(timer);
    });
  }
};

function deleteNote(noteId) {
  if (confirm("Are you sure you want to delete this note?")) {
    notesStore.deleteNote(noteId);
  }
}
</script>

<template>
  <div class="notes-container" v-if="notes.length > 0">
    <h3 class="notes-heading">Notes</h3>
    <div v-for="note in notes"
         :key="note.id"
         class="note-row"
         :class="{ highlighted: note.highlighted }"
         data-test="note-row"
         v-touch-hold="() => deleteNote(note.id)"
         @click="allowHighlight && notesStore.toggleHighlight(note.id)">
      <div class="end-number">End {{ note.endNumber }}</div>
      <p class="note-content" data-test="note-text">{{ note.text }}</p>
    </div>
  </div>
</template>

<style scoped>
.notes-container {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  margin: 1rem 0;
  padding: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notes-heading {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--color-text-light);
  text-align: center;
}

.note-row {
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0;
}

.note-row:last-child {
  border-bottom: none;
}

.highlighted {
  background-color: rgba(255, 215, 0, 0.2);
  border-radius: 8px;
}

.end-number {
  font-size: 0.9rem;
  min-width: 80px;
  font-weight: 600;
  padding: 0.5rem;
  color: var(--color-text-light);
}

.note-content {
  flex-grow: 1;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
  padding: 0.5rem;
}

@media (min-width: 768px) {
  .notes-container {
    max-width: 800px;
    margin: 1rem auto;
  }

  .end-number {
    min-width: 100px;
  }

  .note-content {
    font-size: 1rem;
  }
}
</style>
