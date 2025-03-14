import { describe, expect, test } from "vitest";
import { calculateDistanceTotals } from "@/domain/scoring/distance_totals";
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

  test("practice round with 6 arrows per end", () => {
    const gameType = "practice 50m";
    const practiceScores = [10, 9, 9, 8, 8, 7]; // One end of 6 arrows
    const result = calculateDistanceTotals(practiceScores, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/practice_50m_one_end.json"
    );

    // Basic structure validation
    expect(result).toHaveLength(1); // Should have one distance
    expect(result[0].roundBreakdown).toHaveLength(1); // Should have one end pair
    expect(result[0].subTotals.totalScore).toBe(51); // Sum of the scores
  });

  test("practice round with multiple ends", () => {
    const gameType = "practice 30yd";
    const practiceScores = [
      9, 7, 7, 5, 5, 3, // First end
      9, 7, 7, 5, 5, 3, // Second end
      9, 7, 7, 5, 5, 3  // Third end
    ];
    const result = calculateDistanceTotals(practiceScores, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/practice_30yd_multiple_ends.json"
    );

    // Basic structure validation
    expect(result).toHaveLength(1); // Should have one distance
    expect(result[0].roundBreakdown).toHaveLength(2); // Should have two end pairs (first+second, third+empty)
    expect(result[0].subTotals.totalScore).toBe(108); // Sum of all scores
  });

  test("practice round with odd number of ends", () => {
    const gameType = "practice 70m";
    const practiceScores = [
      10, 10, 9, 9, 8, 8, // First end
      10, 9, 9, 8, 8, 7,  // Second end
      9, 9, 8, 8, 7, 7    // Third end
    ];
    const result = calculateDistanceTotals(practiceScores, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/practice_70m_odd_ends.json"
    );

    // Check that the last end pair has an empty second end
    expect(result[0].roundBreakdown[1].firstEnd).toHaveLength(6);
    expect(result[0].roundBreakdown[1].secondEnd).toHaveLength(0);
  });

  test("practice round with partial end", () => {
    const gameType = "practice 20m";
    const practiceScores = [10, 9, 8, 7]; // Incomplete end
    const result = calculateDistanceTotals(practiceScores, gameType, 6);

    expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
      "./__snapshots__/practice_20m_partial_end.json"
    );

    // Check that the partial end is handled correctly
    expect(result[0].roundBreakdown[0].firstEnd).toHaveLength(4);
    expect(result[0].subTotals.totalScore).toBe(34);
  });
});