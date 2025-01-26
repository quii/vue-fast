import { beforeEach, describe, expect, test, vi } from "vitest";
import { NewPlayerHistory } from "@/domain/player_history";

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { id: 1, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 490 },
        { id: 2, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 602 },
        { id: 3, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 701 },
        { id: 4, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 782 }
      ])
    })
  );
});

describe("player history", () => {
  test("keeps records sorted and adds top score indicator", async () => {
    const storage = { value: [] };
    const playerHistory = NewPlayerHistory(storage);

    playerHistory.add(new Date().addDays(2), 456, "national 50", [1, 2, 3], "yd");
    playerHistory.add(new Date().addDays(5), 200, "national 50", [1, 2, 3], "yd");
    playerHistory.add(new Date().addDays(10), 123, "national 50", [1, 2, 3], "yd");
    playerHistory.add(new Date().addDays(10), 826, "windsor 50", [1, 2, 3], "yd");

    const sortedHistory = await playerHistory.sortedHistory("male", "senior", "recurve");
    expect(sortedHistory).toHaveLength(4);
    expect(sortedHistory[0].score).toEqual(123);
    expect(sortedHistory[0].topScore).toBeFalsy();
    expect(sortedHistory[1].topScore).toBeTruthy();
    expect(sortedHistory[2].topScore).toBeFalsy();
    expect(sortedHistory[3].topScore).toBeTruthy();
  });

  test("it can retrieve your personal best for a round", () => {
    const storage = { value: [] };
    const playerHistory = NewPlayerHistory(storage);

    playerHistory.add(new Date(), 456, "national 50", [1, 2, 3], "yd");
    playerHistory.add(new Date(), 826, "windsor 50", [1, 2, 3], "yd");

    expect(playerHistory.personalBest("national 50")).toEqual(456);
    expect(playerHistory.personalBest("windsor 50")).toEqual(826);
    expect(playerHistory.personalBest("frostbite")).toBeUndefined();
  });

  test("it can total up the number of arrows shot", () => {
    const storage = { value: [] };
    const playerHistory = NewPlayerHistory(storage);

    playerHistory.add(new Date(), 456, "national 50", [1, 2, 3], "yd");
    expect(playerHistory.totalArrows()).toEqual(3);
  });

  test("gets unique game types from recent games, ordered by most recent first", () => {
    const storage = { value: [] };
    const playerHistory = NewPlayerHistory(storage);

    const now = new Date();
    const oneWeekAgo = new Date().addDays(-7);
    const twoWeeksAgo = new Date().addDays(-14);
    const sevenWeeksAgo = new Date().addDays(-49);

    playerHistory.add(twoWeeksAgo, 200, "national", [1, 2, 3], "yd");
    playerHistory.add(oneWeekAgo, 300, "windsor", [1, 2, 3], "yd");
    playerHistory.add(now, 100, "national", [1, 2, 3], "yd");
    playerHistory.add(sevenWeeksAgo, 400, "york", [1, 2, 3], "yd");

    const recentTypes = playerHistory.getRecentGameTypes();
    expect(recentTypes).toEqual(["national", "windsor"]);
  });
});