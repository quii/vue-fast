import { describe, expect, test, vi, beforeEach } from "vitest";
import {
  calculateClassification,
  createClassificationCalculator,
  getRelevantClassifications,
  calculateIfArcherIsOnTrackForNextClassification,
  calculatePotentialClassificationWithoutOutliers
} from "@/domain/scoring/classification";
import { calculateTotal } from "@/domain/scoring/subtotals";

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


describe("classification for AGB", () => {
  test("can get classifications available for a round and given person who achieved A3", async () => {
    const calculator = await createClassificationCalculator("windsor", "male", "senior", "recurve");
    expect(calculator(490, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2, scheme: "AGB" },
      { name: "A2", score: 602, achieved: false, shortBy: 112, scorePerEnd: 34, perEndDiff: -4, scheme: "AGB" },
      { name: "A1", score: 701, achieved: false, shortBy: 211, scorePerEnd: 39, perEndDiff: -9, scheme: "AGB" },
      { name: "B3", score: 782, achieved: false, shortBy: 292, scorePerEnd: 44, perEndDiff: -14, scheme: "AGB" }
    ]);
  });

  test("can get classifications available for a round and given person who achieved B3", async () => {
    const calculator = await createClassificationCalculator("windsor", "male", "senior", "recurve");
    expect(calculator(782, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2, scheme: "AGB" },
      { name: "A2", score: 602, achieved: true, shortBy: null, scorePerEnd: 34, perEndDiff: -4, scheme: "AGB" },
      { name: "A1", score: 701, achieved: true, shortBy: null, scorePerEnd: 39, perEndDiff: -9, scheme: "AGB" },
      { name: "B3", score: 782, achieved: true, shortBy: null, scorePerEnd: 44, perEndDiff: -14, scheme: "AGB" }
    ]);
  });

  test("can get classifications available for a round and given person who is short of B3 by 10", async () => {
    const calculator = await createClassificationCalculator("windsor", "male", "senior", "recurve");
    expect(calculator(772, 30)).toEqual([
      { name: "A3", score: 490, achieved: true, shortBy: null, scorePerEnd: 28, perEndDiff: 2, scheme: "AGB" },
      { name: "A2", score: 602, achieved: true, shortBy: null, scorePerEnd: 34, perEndDiff: -4, scheme: "AGB" },
      { name: "A1", score: 701, achieved: true, shortBy: null, scorePerEnd: 39, perEndDiff: -9, scheme: "AGB" },
      { name: "B3", score: 782, achieved: false, shortBy: 10, scorePerEnd: 44, perEndDiff: -14, scheme: "AGB" }
    ]);
  });
});

describe("classification for frostbite", () => {
  test("calculates frostbite badges earned", async () => {
    const calculator = await createClassificationCalculator("frostbite", "male", "senior", "recurve");
    expect(calculator(101, 50)).toContainEqual(
      { name: "100", score: 100, achieved: true, shortBy: null, scorePerEnd: 17, perEndDiff: 33, scheme: "Frostbite" }
    );
  });

  test("includes personal best in classifications", async () => {
    const calculator = await createClassificationCalculator("frostbite", "male", "senior", "recurve", 345);
    const classifications = calculator(340, 30);
    expect(classifications).toContainEqual(
      expect.objectContaining({
        name: "PB",
        score: 345,
        achieved: false,
        scheme: "Frostbite"
      })
    );
  });
});

describe("calculateClassification", () => {
  test("calculates what classification you got from a score", async () => {
    const calculator = calculateClassification("male", "senior", "recurve");
    expect((await calculator("windsor", 489)).name).toEqual("U/C");
    expect((await calculator("windsor", 490)).name).toEqual("A3");
    expect((await calculator("windsor", 602)).name).toEqual("A2");
    expect((await calculator("windsor", 701)).name).toEqual("A1");
  });
});

describe("createClassificationCalculator", () => {
  test("returns null when missing parameters", async () => {
    expect(await createClassificationCalculator(null, "male", "senior", "recurve")).toBe(null);
    expect(await createClassificationCalculator("windsor", null, "senior", "recurve")).toBe(null);
    expect(await createClassificationCalculator("windsor", "male", null, "recurve")).toBe(null);
    expect(await createClassificationCalculator("windsor", "male", "senior", null)).toBe(null);
  });
});

describe("getRelevantClassifications", () => {
  test("handles empty classifications", () => {
    expect(getRelevantClassifications([])).toEqual([]);
    expect(getRelevantClassifications(null)).toEqual([]);
    expect(getRelevantClassifications(undefined)).toEqual([]);
  });

  test("returns highest achieved non-PB and next unachieved", () => {
    const classifications = [
      { name: "PB", achieved: true, score: 500 },
      { name: "A3", achieved: true, score: 300 },
      { name: "A2", achieved: true, score: 400 },
      { name: "A1", achieved: false, score: 600 }
    ];
    expect(getRelevantClassifications(classifications)).toEqual([
      { name: "A2", achieved: true, score: 400 },
      { name: "PB", achieved: true, score: 500 },
      { name: "A1", achieved: false, score: 600 }
    ]);
  });
});

describe("calculateIfArcherIsOnTrackForNextClassification", () => {
  test("returns false when archer is below required average", async () => {
    const onTrack = await calculateIfArcherIsOnTrackForNextClassification(
      25,
      "A3",
      "windsor",
      "male",
      "senior",
      "recurve"
    );
    expect(onTrack).toBe(false);
  });

  test("returns true when archer is above required average", async () => {
    const onTrack = await calculateIfArcherIsOnTrackForNextClassification(
      35,
      "A3",
      "windsor",
      "male",
      "senior",
      "recurve"
    );
    expect(onTrack).toBe(true);
  });

  test("returns undefined for highest classification", async () => {
    const onTrack = await calculateIfArcherIsOnTrackForNextClassification(
      50,
      "GMB",
      "windsor",
      "male",
      "senior",
      "recurve"
    );
    expect(onTrack).toBe(undefined);
  });
});

describe("calculatePotentialClassificationWithoutOutliers", () => {

  test("returns null for empty scores", async () => {
    const potential = await calculatePotentialClassificationWithoutOutliers(
      [],
      "A3",
      "windsor",
      "male",
      "senior",
      "recurve"
    );
    expect(potential).toBe(null);
  });

  function setScores(scores, count, value) {
    const newScores = [...scores];
    newScores.splice(0, count, ...Array(count).fill(value));
    return newScores;
  }

  test("calculates potential improvement from low scores", async () => {
    const baseScores = Array(108).fill(8);
    const scores = setScores(baseScores, 12, 1);

    const potential = await calculatePotentialClassificationWithoutOutliers(
      scores,
      "A1",
      "windsor",
      "male",
      "senior",
      "recurve"
    );

    expect(potential.achievable).toBe(true);
    expect(potential.arrowsToImprove).toBe(1);
    expect(potential.classification).toBe("B3");
  });
  test("returns null when already at maximum classification", async () => {
    const scores = [10, 10, 10, 10, 10, 10];
    const potential = await calculatePotentialClassificationWithoutOutliers(
      scores,
      "GMB",
      "windsor",
      "male",
      "senior",
      "recurve"
    );
    expect(potential).toBe(null);
  });
});