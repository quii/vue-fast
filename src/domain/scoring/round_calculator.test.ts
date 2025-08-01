import { beforeEach, describe, expect, it, vi } from "vitest";
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

    expect(result).toContain("windsor");
    expect(result).toContain("national");
    expect(result).toContain("western");
    expect(result).toContain("american");
    expect(result).toContain("warwick");

    expect(result).not.toContain("york");
    expect(result).not.toContain("hereford");

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
      const config = gameTypeConfig[r];
      return config && config.isOutdoor && r !== "frostbite" && r !== "360 qualification round";
    });

    expect(outdoorRounds.length).toBe(0);
    expect(result).toContain("frostbite");
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

    // B3 should have access to more challenging rounds
    expect(result).toContain("york");
    expect(result).toContain("st. george");

    // But easier rounds should be excluded as they're too easy for B3
    expect(result).not.toContain("windsor");
    expect(result).not.toContain("national");
  });

  it("for B1 archers, include rounds which are b1, even though this wont improve classification", async () => {
    const classification = "B1";
    const result = await calculateAppropriateRounds(
      classification,
      defaultParams.age,
      defaultParams.sex,
      defaultParams.bowtype,
      100
    );

    expect(result).toContain("new warwick");
    expect(result).toContain("york");
    expect(result).toContain("new western");

    // But easier rounds should be excluded as they're too easy for B3
    expect(result).not.toContain("windsor");
    expect(result).not.toContain("national");
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

    // Check for specific rounds from different classification levels
    expect(result).toContain("york");
    expect(result).toContain("st. george");
    expect(result).toContain("albion / long windsor");
    expect(result).toContain("windsor");
    expect(result).toContain("national");
    expect(result).toContain("western");

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

    expect(result).toContain("frostbite");
  });
});
