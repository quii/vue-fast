import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useNotesStore = defineStore("notes", () => {
  const notes = useLocalStorage("notes", []);
  const pendingNotes = useLocalStorage("pendingNotes", []);

  function addPendingNote(endNumber, noteText) {
    const sanitizedNote = sanitizeNote(noteText);
    const noteId = crypto.randomUUID();
    pendingNotes.value.push({
      id: noteId,
      endNumber,
      text: sanitizedNote,
      timestamp: new Date().toISOString()
    });
  }

  function assignPendingNotesToShoot(shootId) {
    const notesToAssign = pendingNotes.value.map(note => ({
      ...note,
      shootId
    }));
    notes.value.push(...notesToAssign);
    pendingNotes.value = [];
  }

  function deleteNote(noteId) {
    notes.value = notes.value.filter(note => note.id !== noteId);
    pendingNotes.value = pendingNotes.value.filter(note => note.id !== noteId);
  }

  function getNotesByShootId(shootId) {
    return notes.value.filter(note => note.shootId === shootId);
  }

  function sanitizeNote(text) {
    return text.replace(/[<>]/g, "");
  }

  return {
    notes,
    pendingNotes,
    addPendingNote,
    assignPendingNotesToShoot,
    deleteNote,
    getNotesByShootId
  };
});
