import { describe, expect, test } from "vitest";
import { calculateClassifications } from "@/domain/classification";

describe("classification", () => {
  test("can get classifications available for a round and given person who achieved A3", () => {
    const classifications = calculateClassifications("windsor", "male", "senior", "recurve", 490);
    expect(classifications).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null },
      { name: "A2", score: 602, achieved: false, shortBy: 112 },
      { name: "A1", score: 701, achieved: false, shortBy: 211 },
      { name: "B3", score: 782, achieved: false, shortBy: 292 }
    ]);
  });

  test("can get classifications available for a round and given person who achieved B3", () => {
    const classifications = calculateClassifications("windsor", "male", "senior", "recurve", 782);
    expect(classifications).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null },
      { name: "A2", score: 602, achieved: true, shortBy: null },
      { name: "A1", score: 701, achieved: true, shortBy: null },
      { name: "B3", score: 782, achieved: true, shortBy: null }
    ]);
  });

  test("can get classifications available for a round and given person who is short of B3 by 10", () => {
    const classifications = calculateClassifications("windsor", "male", "senior", "recurve", 772);
    expect(classifications).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null },
      { name: "A2", score: 602, achieved: true, shortBy: null },
      { name: "A1", score: 701, achieved: true, shortBy: null },
      { name: "B3", score: 782, achieved: false, shortBy: 10 }
    ]);
  });
});
