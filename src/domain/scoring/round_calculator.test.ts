import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateAppropriateRounds } from "./round_calculator";
import { gameTypeConfig } from "./game_types";
import fs from "fs";
import path from "path";

describe("calculateAppropriateRounds", () => {
  const defaultParams = {
    age: "senior",
    sex: "male",
    bowtype: "recurve"
  };

  // Read the actual classification data from the JSON file
  const seniorClassificationData = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/classifications/Men/Recurve/Senior.json"),
      "utf8"
    )
  );

  beforeEach(() => {
    // Mock fetch to return the actual classification data
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve(seniorClassificationData)
      });
    });
  });

  it("returns appropriate rounds for an A1 archer with max distance of 60 yards", async () => {
    const classification = "A1";
    const maxYards = 60;

    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    const roundNames = result.map(r => r.round);

    // Rounds that should be included for A1 at 60 yards
    expect(roundNames).toContain("windsor");
    expect(roundNames).toContain("national");
    expect(roundNames).toContain("western");
    expect(roundNames).toContain("american");
    expect(roundNames).toContain("warwick");

    // Rounds that should be excluded (too long)
    expect(roundNames).not.toContain("york");
    expect(roundNames).not.toContain("hereford");

    expect(global.fetch).toHaveBeenCalled();
  });

  it("returns no outdoor rounds for an A1 archer with max distance of 50 yards", async () => {
    const classification = "A1";
    const maxYards = 50;

    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    // Filter to only include outdoor rounds (excluding frostbite which is special)
    const outdoorRounds = result.filter(r => {
      const config = gameTypeConfig[r.round];
      return config && config.isOutdoor && r.round !== "frostbite";
    });

    // There should be no outdoor rounds for A1 at 50 yards
    expect(outdoorRounds.length).toBe(0);

    // Frostbite should still be included
    const hasFrostbite = result.some(r => r.round === "frostbite");
    expect(hasFrostbite).toBe(true);
  });

  it("for B3 archers, includes challenging rounds but excludes easier rounds", async () => {
    const classification = "B3";
    const maxYards = 100;

    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    const roundNames = result.map(r => r.round);

    // B3 should have access to more challenging rounds
    expect(roundNames).toContain("york");
    expect(roundNames).toContain("st. george");

    // But easier rounds should be excluded as they're too easy for B3
    expect(roundNames).not.toContain("windsor");
    expect(roundNames).not.toContain("national");
  });

  it("returns all rounds for an unclassified archer", async () => {
    const classification = "Unclassified";
    const maxYards = 100;

    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    const roundNames = result.map(r => r.round);

    // Unclassified should have access to all rounds within max distance
    expect(result.length).toBeGreaterThan(0);

    // Check for specific rounds from different classification levels
    expect(roundNames).toContain("york");
    expect(roundNames).toContain("st. george");
    expect(roundNames).toContain("albion / long windsor");
    expect(roundNames).toContain("windsor");
    expect(roundNames).toContain("national");
    expect(roundNames).toContain("western");

    // Should have significantly more rounds than higher classifications
    const b3Result = await calculateAppropriateRounds(
      "B3",
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    expect(result.length).toBeGreaterThan(b3Result.length);
  });

  it("always includes frostbite round regardless of classification", async () => {
    const classification = "GMB";
    const maxYards = 30;

    // Override fetch to return empty data for this test
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve([])
    }));

    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    expect(result.length).toBe(1);
    expect(result[0].round).toBe("frostbite");
  });

  it("sorts rounds by number of ends and then by distance", async () => {
    const classification = "Unclassified";
    const maxYards = 100;

    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      maxYards
    );

    // Check that rounds are sorted by number of ends and then by distance
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const curr = result[i];

      if (prev.numberOfEnds === curr.numberOfEnds) {
        expect(prev.distanceValue).toBeLessThanOrEqual(curr.distanceValue);
      } else {
        expect(prev.numberOfEnds).toBeLessThanOrEqual(curr.numberOfEnds);
      }
    }
  });
});
