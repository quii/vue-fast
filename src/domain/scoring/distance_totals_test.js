import { describe, expect, test } from "vitest";
import { calculateDistanceTotals } from "@/domain/distance_totals";
import { justStartedANational, ruthsFrostbiteGame, ruthsGame } from "@/domain/test_data";

describe("calculateRounds", () => {
  test("snapshot test of ruths first competition", () => {
    const gameType = "windsor";
    const result = calculateDistanceTotals(ruthsGame, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/ruths_first_competition.json"
    );
  });
  test("snapshot of a national round that has had 3 ends", () => {
    const gameType = "national";
    const result = calculateDistanceTotals(justStartedANational, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/just_started_a_national.json"
    );
  });
  test("snapshot test of ruths first competition", () => {
    const gameType = "frostbite";
    const result = calculateDistanceTotals(ruthsFrostbiteGame, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/ruths_first_frostbite.json"
    );
  });
  test("american", () => {
    const gameType = "american";
    // american has 2.5 ends per distance, so 18 arrows are shot per distance
    const halfWaythroughSecondDistanceScores = [
      9, 9, 9, 9, 9, 9,
      7, 7, 7, 7, 7, 7,

      5, 5, 5, 5, 5, 5,
      3, 3, 3, 3, 3, 3,

      1, 1, 1, 1, 1, 1,

      // next distance
      5, 5, 5, 5, 5, 5
    ];
    const result = calculateDistanceTotals(halfWaythroughSecondDistanceScores, gameType, 6);
    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/american.json"
    );
  });
});