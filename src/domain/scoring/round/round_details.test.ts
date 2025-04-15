import { getRoundDetails } from "./round_details";
import { describe, expect, test, vi } from "vitest";
import { formatRoundName } from "@/domain/scoring/round/formatting";

// Mock the gameTypeConfig module
vi.mock("./scoring/game_types", () => {
  return {
    gameTypeConfig: {
      "national": {
        isImperial: true,
        isOutdoor: true,
        maxDistanceYards: 60,
        otherDistancesYards: [50],
        distancesRoundSizes: [4, 2]
      },
      "wa 70m": {
        isImperial: false,
        isOutdoor: true,
        maxDistanceMetres: 70,
        distancesRoundSizes: [6]
      },
      "portsmouth": {
        isImperial: false,
        isOutdoor: false,
        maxDistanceYards: 20,
        distancesRoundSizes: [5]
      },
      "long metric iii": {
        isImperial: false,
        isOutdoor: true,
        maxDistanceMetres: 50,
        otherDistancesMetres: [40],
        otherDistancesYards: [43.8], // This is the converted value
        distancesRoundSizes: [3, 3]
      }
    }
  };
});

describe("getRoundDetails", () => {
  test("returns correct details for an imperial outdoor round", () => {
    const result = getRoundDetails("national");

    expect(result).toEqual({
      name: "national",
      roundType: "Imperial",
      venueType: "Outdoor",
      colorScheme: "imperial",
      distanceInfo: [
        { distance: "60yd", dozens: 4 },
        { distance: "50yd", dozens: 2 }
      ],
      totalDozens: 6,
      totalArrows: 72,
      maxDistance: 60,
      unit: "yd"
    });
  });

  test("returns correct details for a metric outdoor round", () => {
    const result = getRoundDetails("wa 70m");

    expect(result).toEqual({
      name: "wa 70m",
      roundType: "Metric",
      venueType: "Outdoor",
      colorScheme: "metric",
      distanceInfo: [
        { distance: "70m", dozens: 6 }
      ],
      totalDozens: 6,
      totalArrows: 72,
      maxDistance: 70,
      unit: "m"
    });
  });

  test("returns null for an unknown round", () => {
    const result = getRoundDetails("unknown-round");
    expect(result).toBeNull();
  });
});

describe("formatRoundName", () => {
  test("capitalizes first letter of each word", () => {
    expect(formatRoundName("national")).toBe("National");
    expect(formatRoundName("wa 70m")).toBe("Wa 70m");
  });

  test("converts roman numerals to uppercase", () => {
    expect(formatRoundName("bristol i")).toBe("Bristol I");
    expect(formatRoundName("bristol ii")).toBe("Bristol II");
    expect(formatRoundName("bristol iii")).toBe("Bristol III");
    expect(formatRoundName("bristol iv")).toBe("Bristol IV");
    expect(formatRoundName("bristol v")).toBe("Bristol V");
  });

  test("handles mixed case input", () => {
    expect(formatRoundName("NATIONAL")).toBe("National");
    expect(formatRoundName("WA 70M")).toBe("Wa 70m");
  });

  test("returns empty string for empty input", () => {
    expect(formatRoundName("")).toBe("");
    expect(formatRoundName(null)).toBe("");
    expect(formatRoundName(undefined)).toBe("");
  });
});

test("correctly handles metric rounds with both yard and meter distances", () => {
  const result = getRoundDetails("long metric iii");

  // The test should verify that for a metric round, we always use metres
  expect(result.distanceInfo).toEqual([
    { distance: "50m", dozens: 3 },
    { distance: "40m", dozens: 3 }
  ]);

  expect(result.maxDistance).toBe(50);
  expect(result.unit).toBe("m");
});
