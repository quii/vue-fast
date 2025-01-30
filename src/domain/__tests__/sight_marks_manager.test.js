import { describe, it, expect } from "vitest";
import { SightMarksManager } from "../sight_marks_manager";

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

});