<script setup>
import { computed } from "vue";
import { useNotesStore } from "@/stores/user_notes";
import DeleteableCard from "@/components/DeleteableCard.vue";

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

function deleteNote(noteId) {
  notesStore.deleteNote(noteId);
}

function handleNoteClick(note) {
  if (props.allowHighlight) {
    notesStore.toggleHighlight(note.id);
  }
}

// Create indicator object for each note
function getIndicatorForNote(note) {
  return {
    text: `End ${note.endNumber}`,
    class: note.highlighted ? "highlighted" : ""
  };
}
</script>

<template>
  <div v-if="notes.length > 0" class="notes-container">
    <DeleteableCard
      v-for="note in notes"
      :key="note.id"
      :highlight="note.highlighted"
      :indicator="getIndicatorForNote(note)"
      @click="handleNoteClick(note)"
      @delete="deleteNote(note.id)"
      data-test="note-row"
    >
      <p class="note-text" data-test="note-text">{{ note.text }}</p>
    </DeleteableCard>
  </div>
</template>

<style scoped>
.notes-container {
  margin-top: 0.5rem;
}

.note-text {
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
  padding: 0.5rem;
}

/* Custom styles for the indicator in DeleteableCard */
:deep(.card-indicator) {
  width: 50px; /* Make the indicator wider to fit "End X" */
  background-color: var(--color-background-mute);
}

:deep(.card-indicator.highlighted) {
  background-color: rgba(255, 215, 0, 0.2); /* Gold background for highlighted notes */
}

:deep(.indicator-text) {
  font-size: 0.9rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .notes-container {
    max-width: 800px;
    margin: 1rem auto;
  }

  .note-text {
    font-size: 1rem;
  }
}
</style>
