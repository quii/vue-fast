import { describe, it, expect } from "vitest";
import { SightMarksManager } from "./sight_marks_manager.js";

describe("SightMarksManager", () => {
  it("adds new sight marks", () => {
    const storage = { value: [] };
    const manager = new SightMarksManager(storage);

    manager.add(20, "m", 5, { major: 5, minor: 6, micro: 2 });

    expect(storage.value).toHaveLength(1);
    expect(storage.value[0]).toMatchObject({
      distance: 20,
      unit: "m",
      notches: 5,
      vertical: {
        major: 5,
        minor: 6,
        micro: 2
      },
      priority: false
    })
    expect(storage.value[0].id).toBeTruthy();
  });

  it("creates independent copies of vertical objects for each mark", () => {
    const storage = { value: [] };
    const manager = new SightMarksManager(storage);

    // Create a vertical object that we'll reuse
    const vertical = { major: 5, minor: 6, micro: 2 };

    // Add first mark with the vertical object
    manager.add(20, "m", 5, vertical);

    // Modify the original vertical object
    vertical.major = 7;
    vertical.minor = 8;
    vertical.micro = 9;

    // Add second mark with the modified vertical object
    manager.add(30, "m", 6, vertical);

    // Verify both marks have their own independent vertical objects
    expect(storage.value).toHaveLength(2);

    // First mark should have the original values
    expect(storage.value[0].vertical).toEqual({ major: 5, minor: 6, micro: 2 });

    // Second mark should have the new values
    expect(storage.value[1].vertical).toEqual({ major: 7, minor: 8, micro: 9 });

    // Modify the first mark's vertical object
    storage.value[0].vertical.major = 9;

    // Verify it doesn't affect the second mark
    expect(storage.value[1].vertical.major).toBe(7);
  });

  it("updates existing sight marks", () => {
    const id = "123";
    const storage = {
      value: [{
        id,
        distance: 20,
        unit: "m",
        notches: 5,
        vertical: { major: 5, minor: 6, micro: 2 }
      }]
    };
    const manager = new SightMarksManager(storage);

    manager.update(id, 20, "m", 6, { major: 5, minor: 7, micro: 2 });

    expect(storage.value).toHaveLength(1);
    expect(storage.value[0].notches).toBe(6);
    expect(storage.value[0].vertical.minor).toBe(7);
  });

  it("deletes sight marks", () => {
    const id = "123";
    const storage = {
      value: [{
        distance: 20,
        id,
        unit: "m",
        notches: 5,
        vertical: { major: 5, minor: 6, micro: 2 }
      }]
    };
    const manager = new SightMarksManager(storage);

    manager.delete(id);

    expect(storage.value).toHaveLength(0);
  });


  it("returns marks sorted by distance, converting yards to metres", () => {
    const storage = {
      value: [
        { distance: 50, unit: "m", notches: 5 },
        { distance: 60, unit: "yd", notches: 6 },
        { distance: 30, unit: "m", notches: 3 }
      ]
    };
    const manager = new SightMarksManager(storage);

    const sortedMarks = manager.getAll();

    expect(sortedMarks[0].distance).toBe(30);
    expect(sortedMarks[1].distance).toBe(50);
    expect(sortedMarks[2].distance).toBe(60);
  });

  it("adds new sight marks with priority defaulted to false", () => {
    const storage = { value: [] };
    const manager = new SightMarksManager(storage);

    manager.add(20, "m", 5, { major: 5, minor: 6, micro: 2 });

    expect(storage.value[0].priority).toBe(false);
  });

  it("toggles priority of a sight mark", () => {
    const storage = {
      value: [{
        distance: 20,
        unit: "m",
        notches: 5,
        vertical: { major: 5, minor: 6, micro: 2 },
        priority: false
      }]
    };
    const manager = new SightMarksManager(storage);

    manager.togglePriority(20, "m");

    expect(storage.value[0].priority).toBe(true);
  });

  it("sorts by priority first, then by distance", () => {
    const storage = {
      value: [
        { distance: 50, unit: "m", notches: 5, priority: false },
        { distance: 30, unit: "m", notches: 3, priority: true },
        { distance: 20, unit: "m", notches: 2, priority: true }
      ]
    };
    const manager = new SightMarksManager(storage);

    const sortedMarks = manager.getAll();

    expect(sortedMarks[0].distance).toBe(20);
    expect(sortedMarks[1].distance).toBe(30);
    expect(sortedMarks[2].distance).toBe(50);
  });

});
