<script setup>
import { computed } from "vue";
import { useNotesStore } from "@/stores/user_notes";

const props = defineProps({
  shootId: {
    type: String,
    required: false,
    default: null
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
         v-touch-hold="() => deleteNote(note.id)">
      <div class="end-number">End {{ note.endNumber }}</div>
      <p class="note-content">{{ note.text }}</p>
    </div>
  </div>
</template>

<style scoped>
.notes-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.note-row {
  display: flex;
  align-items: flex-start;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-border);
}

.end-number {
  font-size: 1.1rem;
  min-width: 100px;
  font-weight: bold;
  padding-top: 0.5rem;
}

.note-content {
  flex-grow: 1;
  font-size: 1.1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
  padding: 0.5rem 1rem 0 1rem;
}

.delete-button {
  font-size: 1.8rem;
  width: 3rem;
  height: 3rem;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.delete-button:hover {
  color: var(--color-border);
}
</style>

