import { describe, expect, test } from "vitest";
import { calculateClassification, createClassificationCalculator } from "@/domain/classification";

describe("classification for AGB", () => {
  const calculator = createClassificationCalculator("windsor", "male", "senior", "recurve");
  test("can get classifications available for a round and given person who achieved A3", () => {
    expect(calculator(490, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2, scheme: "AGB" },
      { name: "A2", score: 602, achieved: false, shortBy: 112, scorePerEnd: 34, perEndDiff: -4, scheme: "AGB" },
      { name: "A1", score: 701, achieved: false, shortBy: 211, scorePerEnd: 39, perEndDiff: -9, scheme: "AGB" },
      { name: "B3", score: 782, achieved: false, shortBy: 292, scorePerEnd: 44, perEndDiff: -14, scheme: "AGB" }
    ]);
  });

  test("can get classifications available for a round and given person who achieved B3", () => {
    expect(calculator(782, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2, scheme: "AGB" },
      { name: "A2", score: 602, achieved: true, shortBy: null, scorePerEnd: 34, perEndDiff: -4, scheme: "AGB" },
      { name: "A1", score: 701, achieved: true, shortBy: null, scorePerEnd: 39, perEndDiff: -9, scheme: "AGB" },
      { name: "B3", score: 782, achieved: true, shortBy: null, scorePerEnd: 44, perEndDiff: -14, scheme: "AGB" }
    ]);
  });

  test("can get classifications available for a round and given person who is short of B3 by 10", () => {
    expect(calculator(772, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2, scheme: "AGB" },
      { name: "A2", score: 602, achieved: true, shortBy: null, scorePerEnd: 34, perEndDiff: -4, scheme: "AGB" },
      { name: "A1", score: 701, achieved: true, shortBy: null, scorePerEnd: 39, perEndDiff: -9, scheme: "AGB" },
      { name: "B3", score: 782, achieved: false, shortBy: 10, scorePerEnd: 44, perEndDiff: -14, scheme: "AGB" }
    ]);
  });
});

describe("classification for frostbite", () => {
  const calculator = createClassificationCalculator("frostbite", "male", "senior", "recurve");
  test("calculates frostbite badges earned", () => {
    expect(calculator(101, 50)).toContainEqual(
      { name: "100", score: 100, achieved: true, shortBy: null, scorePerEnd: 17, perEndDiff: 33, scheme: "Frostbite" }
    );
  });
});

describe("calculateClassification", () => {
  test("calculates what classification you got from a score", () => {
    const calculator = calculateClassification("male", "senior", "recurve");
    expect(calculator("windsor", 489).name).toEqual("U/C");
    expect(calculator("windsor", 490).name).toEqual("A3");
    expect(calculator("windsor", 602).name).toEqual("A2");
    expect(calculator("windsor", 701).name).toEqual("A1");
  });
});