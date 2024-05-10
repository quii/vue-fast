import { describe, expect, test } from "vitest";
import { NewPlayerHistory } from "@/domain/player_history";

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

describe("player history", () => {
  const storage = { value: [] };
  const playerHistory = NewPlayerHistory(storage);

  playerHistory.add(new Date().addDays(2), 456, "national 50", [1, 2, 3], "yd");
  playerHistory.add(new Date().addDays(5), 200, "national 50", [1, 2, 3], "yd");
  playerHistory.add(new Date().addDays(10), 123, "national 50", [1, 2, 3], "yd");
  playerHistory.add(new Date().addDays(10), 826, "windsor 50", [1, 2, 3], "yd");

  test("keeps records sorted and adds top score indicator", () => {
    const sortedHistory = playerHistory.sortedHistory();
    expect(sortedHistory).toHaveLength(4);
    expect(sortedHistory[0].score).toEqual(123);
    expect(sortedHistory[0].topScore).toBeFalsy();
    expect(sortedHistory[1].topScore).toBeTruthy();
    expect(sortedHistory[2].topScore).toBeFalsy();
    expect(sortedHistory[3].topScore).toBeTruthy();
  });

  test("it can retrieve your personal best for a round", () => {
    expect(playerHistory.personalBest("national 50")).toEqual(456);
    expect(playerHistory.personalBest("windsor 50")).toEqual(826);
    expect(playerHistory.personalBest("frostbite")).toBeUndefined();
  });
});