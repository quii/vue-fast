import { describe, it, expect } from "vitest";
import { NewNotesManager } from "./notes_manager";

describe("NotesManager", () => {
  it("adds pending notes", () => {
    const storage = { value: [] };
    const pendingStorage = { value: [] };
    const notesManager = NewNotesManager(storage, pendingStorage);

    notesManager.addPendingNote(1, "Good form");

    expect(pendingStorage.value).toHaveLength(1);
    expect(pendingStorage.value[0]).toMatchObject({
      endNumber: 1,
      text: "Good form"
    });
  });

  it("sanitizes notes", () => {
    const storage = { value: [] };
    const pendingStorage = { value: [] };
    const notesManager = NewNotesManager(storage, pendingStorage);

    notesManager.addPendingNote(1, "<script>alert('xss')</script>");

    expect(pendingStorage.value[0].text).toBe("scriptalert('xss')/script");
  });


  it("assigns pending notes to a shoot", () => {
    const storage = { value: [] };
    const pendingStorage = {
      value: [
        { id: "1", endNumber: 1, text: "note 1" },
        { id: "2", endNumber: 2, text: "note 2" }
      ]
    };
    const notesManager = NewNotesManager(storage, pendingStorage);

    notesManager.assignPendingNotesToShoot("shoot-1");

    expect(storage.value).toHaveLength(2);
    expect(storage.value[0].shootId).toBe("shoot-1");
    expect(pendingStorage.value).toHaveLength(0);
  });

  it("deletes notes from both storages", () => {
    const storage = { value: [{ id: "1", text: "note 1" }] };
    const pendingStorage = { value: [{ id: "2", text: "note 2" }] };
    const notesManager = NewNotesManager(storage, pendingStorage);

    notesManager.deleteNote("1");
    notesManager.deleteNote("2");

    expect(storage.value).toHaveLength(0);
    expect(pendingStorage.value).toHaveLength(0);
  });

  it("gets notes by shoot id", () => {
    const storage = {
      value: [
        { id: "1", shootId: "shoot-1", text: "note 1" },
        { id: "2", shootId: "shoot-2", text: "note 2" },
        { id: "3", shootId: "shoot-1", text: "note 3" }
      ]
    };
    const pendingStorage = { value: [] };
    const notesManager = NewNotesManager(storage, pendingStorage);

    const notes = notesManager.getNotesByShootId("shoot-1");

    expect(notes).toHaveLength(2);
    expect(notes[0].text).toBe("note 1");
    expect(notes[1].text).toBe("note 3");
  });

  it("toggles note highlight state", () => {
    const storage = { value: [{ id: "1", text: "note 1", highlighted: false }] };
    const pendingStorage = { value: [] };
    const notesManager = NewNotesManager(storage, pendingStorage);

    notesManager.toggleHighlight("1");
    expect(storage.value[0].highlighted).toBe(true);

    notesManager.toggleHighlight("1");
    expect(storage.value[0].highlighted).toBe(false);
  });

});
