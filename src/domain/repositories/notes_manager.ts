export function NewNotesManager(storage, pendingStorage) {
  return {
    addPendingNote: (endNumber, noteText) => {
      const sanitizedNote = sanitizeNote(noteText);
      const noteId = crypto.randomUUID();
      pendingStorage.value.push({
        id: noteId,
        endNumber,
        text: sanitizedNote,
        timestamp: new Date().toISOString()
      });
    },

    assignPendingNotesToShoot: (shootId) => {
      const notesToAssign = pendingStorage.value.map(note => ({
        ...note,
        shootId
      }));
      storage.value.push(...notesToAssign);
      pendingStorage.value = [];
    },

    deleteNote: (noteId) => {
      storage.value = storage.value.filter(note => note.id !== noteId);
      pendingStorage.value = pendingStorage.value.filter(note => note.id !== noteId);
    },

    getNotesByShootId: (shootId) => {
      return storage.value.filter(note => note.shootId === shootId);
    },

    toggleHighlight: (noteId) => {
      storage.value = storage.value.map(note =>
        note.id === noteId ? { ...note, highlighted: !note.highlighted } : note
      );
      pendingStorage.value = pendingStorage.value.map(note =>
        note.id === noteId ? { ...note, highlighted: !note.highlighted } : note
      );
    },

    importNotes: (data) => {
      storage.value = data.notes || [];
      pendingStorage.value = data.pendingNotes || [];
    }
  };
}

function sanitizeNote(text) {
  return text.replace(/[<>]/g, "");
}
