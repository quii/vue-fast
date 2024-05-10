import { describe, expect, test } from "vitest";
import { NewPlayerHistory } from "@/domain/player_history";

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

describe("player history", () => {
  test("keeps records sorted and adds top score indicator", () => {
    const storage = { value: [] };
    const playerHistory = NewPlayerHistory(storage);

    playerHistory.add(new Date().addDays(2), 456, "national 50", [1, 2, 3], "yd");
    playerHistory.add(new Date().addDays(5), 200, "national 50", [1, 2, 3], "yd");
    playerHistory.add(new Date().addDays(10), 123, "national 50", [1, 2, 3], "yd");

    const sortedHistory = playerHistory.sortedHistory();
    expect(sortedHistory).toHaveLength(3);
    expect(sortedHistory[0].score).toEqual(123);
    expect(sortedHistory[0].topScore).toBeFalsy();
    expect(sortedHistory[1].topScore).toBeFalsy();
    expect(sortedHistory[2].topScore).toBeTruthy();
  });
});