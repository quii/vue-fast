import { describe, it, expect } from "vitest";
import { SightMarksManager } from "./sight_marks_manager.js";

describe("SightMarksManager", () => {
  it("adds new sight marks", () => {
    const storage = { value: [] };
    const manager = new SightMarksManager(storage);

    manager.add(20, "m", 5, { major: 5, minor: 6, micro: 2 });

    expect(storage.value).toHaveLength(1);
    expect(storage.value[0]).toEqual({
      distance: 20,
      unit: "m",
      notches: 5,
      priority: false,
      vertical: { major: 5, minor: 6, micro: 2 }
    });
  });

  it("updates existing sight marks", () => {
    const storage = {
      value: [{
        distance: 20,
        unit: "m",
        notches: 5,
        vertical: { major: 5, minor: 6, micro: 2 }
      }]
    };
    const manager = new SightMarksManager(storage);

    manager.update(20, "m", 6, { major: 5, minor: 7, micro: 2 });

    expect(storage.value).toHaveLength(1);
    expect(storage.value[0].notches).toBe(6);
    expect(storage.value[0].vertical.minor).toBe(7);
  });

  it("deletes sight marks", () => {
    const storage = {
      value: [{
        distance: 20,
        unit: "m",
        notches: 5,
        vertical: { major: 5, minor: 6, micro: 2 }
      }]
    };
    const manager = new SightMarksManager(storage);

    manager.delete(20, "m");

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
