import { describe, expect, test } from "vitest";
import { createClassificationCalculator } from "@/domain/classification";

describe("classification", () => {
  const calculator = createClassificationCalculator("windsor", "male", "senior", "recurve");
  test("can get classifications available for a round and given person who achieved A3", () => {
    expect(calculator(490, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2 },
      { name: "A2", score: 602, achieved: false, shortBy: 112, scorePerEnd: 34, perEndDiff: -4 },
      { name: "A1", score: 701, achieved: false, shortBy: 211, scorePerEnd: 39, perEndDiff: -9 },
      { name: "B3", score: 782, achieved: false, shortBy: 292, scorePerEnd: 44, perEndDiff: -14 }
    ]);
  });

  test("can get classifications available for a round and given person who achieved B3", () => {
    expect(calculator(782, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2 },
      { name: "A2", score: 602, achieved: true, shortBy: null, scorePerEnd: 34, perEndDiff: -4 },
      { name: "A1", score: 701, achieved: true, shortBy: null, scorePerEnd: 39, perEndDiff: -9 },
      { name: "B3", score: 782, achieved: true, shortBy: null, scorePerEnd: 44, perEndDiff: -14 }
    ]);
  });

  test("can get classifications available for a round and given person who is short of B3 by 10", () => {
    expect(calculator(772, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2 },
      { name: "A2", score: 602, achieved: true, shortBy: null, scorePerEnd: 34, perEndDiff: -4 },
      { name: "A1", score: 701, achieved: true, shortBy: null, scorePerEnd: 39, perEndDiff: -9 },
      { name: "B3", score: 782, achieved: false, shortBy: 10, scorePerEnd: 44, perEndDiff: -14 }
    ]);
  });
});
