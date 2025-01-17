import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { NewNotesManager } from "@/domain/notes_manager";

export const useNotesStore = defineStore("notes", () => {
  const notes = useLocalStorage("notes", []);
  const pendingNotes = useLocalStorage("pendingNotes", []);

  const notesManager = NewNotesManager(notes, pendingNotes);

  return {
    notes,
    pendingNotes,
    ...notesManager
  };
});