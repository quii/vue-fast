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
  <div class="notes-container">
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
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.note-row {
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
}

.highlighted {
  background-color: gold;
  color: black;
  border-radius: 8px;
}

.end-number {
  font-size: 1.1rem;
  min-width: 100px;
  font-weight: bold;
  padding: 0.8rem 1rem;
}

.note-content {
  flex-grow: 1;
  font-size: 1.1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
  padding: 0.8rem 1rem;
}
</style>

