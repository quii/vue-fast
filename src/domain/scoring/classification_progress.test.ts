import {
  calculateAllClassificationProgress,
  calculateClassificationProgress
} from "@/domain/scoring/classification_progress.js";
import { describe, it, expect } from "vitest";

describe("Classification Progress", () => {
  describe("calculateClassificationProgress", () => {
    it("returns zero progress for missing parameters", () => {
      const result = calculateClassificationProgress(null, "recurve", "A1", "indoor", "2023-10-01");
      expect(result.dozenArrowsShot).toBe(0);
      expect(result.dozenArrowsRequired).toBe(0);
      expect(result.qualifyingShoots).toEqual([]);
    });

    it("calculates progress for Unclassified archers toward A3", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "A3" } // Shot to A3 standard
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "Unclassified", "indoor", "2023-10-01"
      );

      expect(result.nextClassification).toBe("A3");
      expect(result.dozenArrowsShot).toBe(5); // 5 dozen arrows
      expect(result.dozenArrowsRequired).toBe(10); // Archer tier requires 10 dozen
      expect(result.qualifyingShoots.length).toBe(1);
    });

    it("calculates progress toward next classification (A3 to A2)", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "A2" } // Shot to A2 standard
        },
        {
          id: 2,
          date: "2023-12-01",
          gameType: "worcester",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "A2" } // Shot to A2 standard
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A3", "indoor", "2023-10-01"
      );

      expect(result.nextClassification).toBe("A2");
      expect(result.dozenArrowsShot).toBe(10); // 5 + 5 dozen
      expect(result.dozenArrowsRequired).toBe(10);
      expect(result.qualifyingShoots.length).toBe(2);
    });

    it("calculates progress toward next classification (A1 to B3)", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" } // Shot to B3 standard
        },
        {
          id: 2,
          date: "2023-12-01",
          gameType: "worcester",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" } // Shot to B3 standard
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A1", "indoor", "2023-10-01"
      );

      expect(result.nextClassification).toBe("B3");
      expect(result.dozenArrowsShot).toBe(10); // 5 + 5 dozen
      expect(result.dozenArrowsRequired).toBe(15); // Bowmen tier requires 15 dozen
      expect(result.qualifyingShoots.length).toBe(2);
    });

    it("only counts shoots that meet the next classification standard", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        },
        {
          id: 2,
          date: "2023-12-01",
          gameType: "worcester",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "A2" } // Shot to A2 standard (not good enough for B3)
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A1", "indoor", "2023-10-01"
      );

      expect(result.nextClassification).toBe("B3");
      expect(result.dozenArrowsShot).toBe(5); // Only the B3 shoot counts
      expect(result.dozenArrowsRequired).toBe(15);
      expect(result.qualifyingShoots.length).toBe(1);
    });

    it("calculates outdoor progress for Bowmen tier correctly", () => {
      const history = [
        {
          id: 1,
          date: "2023-06-15",
          gameType: "national",
          scores: Array(48).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        },
        {
          id: 2,
          date: "2023-07-01",
          gameType: "windsor",
          scores: Array(36).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A1", "outdoor", "2023-04-01"
      );

      expect(result.nextClassification).toBe("B3");
      expect(result.dozenArrowsShot).toBe(7); // 4 + 3 dozen
      expect(result.dozenArrowsRequired).toBe(18);
      expect(result.qualifyingShoots.length).toBe(2);
    });

    it("filters out shoots with wrong bow type", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        },
        {
          id: 2,
          date: "2023-12-01",
          gameType: "worcester",
          scores: Array(60).fill(9),
          userProfile: { bowType: "barebow" },
          classification: { name: "B3" }
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A1", "indoor", "2023-10-01"
      );

      expect(result.dozenArrowsShot).toBe(5); // Only the recurve shoot counts
      expect(result.qualifyingShoots.length).toBe(1);
    });

    it("filters out shoots outside the current season", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15", // In indoor season
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        },
        {
          id: 2,
          date: "2023-05-01", // In outdoor season
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A1", "indoor", "2023-10-01"
      );

      expect(result.dozenArrowsShot).toBe(5); // Only the indoor season shoot counts
      expect(result.qualifyingShoots.length).toBe(1);
    });

    it("filters out shoots with wrong environment", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth", // Indoor round
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        },
        {
          id: 2,
          date: "2023-11-20",
          gameType: "national", // Outdoor round
          scores: Array(48).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "A1", "indoor", "2023-10-01"
      );

      expect(result.dozenArrowsShot).toBe(5); // Only the indoor round counts
      expect(result.qualifyingShoots.length).toBe(1);
    });

    it("returns zero progress when already at highest classification", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "EMB" }
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "EMB", "indoor", "2023-10-01"
      );

      expect(result.dozenArrowsShot).toBe(NaN);
      expect(result.dozenArrowsRequired).toBe(undefined);
    });
  });

  describe("calculateAllClassificationProgress", () => {
    it("returns empty object for missing parameters", () => {
      const result = calculateAllClassificationProgress(null, {}, {}, "2023-10-01", "2023-04-01", []);
      expect(result).toEqual({});
    });

    it("calculates progress for multiple bow types", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        },
        {
          id: 2,
          date: "2023-06-01",
          gameType: "national",
          scores: Array(72).fill(9),
          userProfile: { bowType: "barebow" },
          classification: { name: "B2" }
        }
      ];

      const indoorClassifications = {
        "recurve": "A1",
        "barebow": "A2"
      };

      const outdoorClassifications = {
        "recurve": "A1",
        "barebow": "B3"
      };

      const result = calculateAllClassificationProgress(
        history,
        indoorClassifications,
        outdoorClassifications,
        "2023-10-01",
        "2023-04-01",
        ["recurve", "barebow"]
      );

      // Check recurve progress
      expect(result.recurve.indoor.nextClassification).toBe("B3");
      expect(result.recurve.indoor.dozenArrowsShot).toBe(5);
      expect(result.recurve.indoor.dozenArrowsRequired).toBe(15);
      expect(result.recurve.outdoor.dozenArrowsShot).toBe(0);

      // Check barebow progress
      expect(result.barebow.indoor.dozenArrowsShot).toBe(0);
      expect(result.barebow.outdoor.nextClassification).toBe("B2");
      expect(result.barebow.outdoor.dozenArrowsShot).toBe(6);
      expect(result.barebow.outdoor.dozenArrowsRequired).toBe(18);
    });

    it("handles missing classifications", () => {
      const history = [
        {
          id: 1,
          date: "2023-11-15",
          gameType: "portsmouth",
          scores: Array(60).fill(9),
          userProfile: { bowType: "recurve" },
          classification: { name: "B3" }
        }
      ];

      const result = calculateAllClassificationProgress(
        history,
        {},
        {},
        "2023-10-01",
        "2023-04-01",
        ["recurve"]
      );

      expect(result.recurve.indoor.dozenArrowsShot).toBe(0);
      expect(result.recurve.indoor.dozenArrowsRequired).toBe(0);
      expect(result.recurve.outdoor.dozenArrowsShot).toBe(0);
      expect(result.recurve.outdoor.dozenArrowsRequired).toBe(0);
    });
  });
});

describe("Master Bowmen Record Status Requirement", () => {
  it("requires record status for MB classification progress", () => {
    const history = [
      {
        id: 1,
        date: "2023-11-15",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "MB" },
        shootStatus: "Competition" // Not record status
      },
      {
        id: 2,
        date: "2023-11-20",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "MB" },
        shootStatus: "RecordStatus" // Record status
      }
    ];

    const result = calculateClassificationProgress(
      history, "recurve", "B1", "indoor", "2023-10-01"
    );

    expect(result.nextClassification).toBe("MB");
    // Only the record status shoot should count
    expect(result.dozenArrowsShot).toBe(5); // 5 dozen from one shoot
    expect(result.qualifyingShoots.length).toBe(1);
    expect(result.qualifyingShoots[0].id).toBe(2); // Only the record status shoot
  });

  it("requires record status for GMB classification progress", () => {
    const history = [
      {
        id: 1,
        date: "2023-11-15",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "GMB" },
        shootStatus: "Practice" // Not record status
      },
      {
        id: 2,
        date: "2023-11-20",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "GMB" },
        shootStatus: "RecordStatus" // Record status
      }
    ];

    const result = calculateClassificationProgress(
      history, "recurve", "MB", "indoor", "2023-10-01"
    );

    expect(result.nextClassification).toBe("GMB");
    // Only the record status shoot should count
    expect(result.dozenArrowsShot).toBe(5); // 5 dozen from one shoot
    expect(result.qualifyingShoots.length).toBe(1);
    expect(result.qualifyingShoots[0].id).toBe(2); // Only the record status shoot
  });

  it("handles legacy data (no shoot status) for master bowmen tiers", () => {
    const history = [
      {
        id: 1,
        date: "2023-11-15",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "MB" }
        // No shootStatus defined (legacy data)
      },
      {
        id: 2,
        date: "2023-11-20",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "MB" },
        shootStatus: "RecordStatus" // Record status
      }
    ];

    const result = calculateClassificationProgress(
      history, "recurve", "B1", "indoor", "2023-10-01"
    );

    expect(result.nextClassification).toBe("MB");
    // Only the record status shoot should count, legacy data should be ignored
    expect(result.dozenArrowsShot).toBe(5); // 5 dozen from one shoot
    expect(result.qualifyingShoots.length).toBe(1);
    expect(result.qualifyingShoots[0].id).toBe(2); // Only the record status shoot
  });

  it("does not require record status for non-master bowmen tiers", () => {
    const history = [
      {
        id: 1,
        date: "2023-11-15",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "B3" },
        shootStatus: "Practice" // Not record status
      },
      {
        id: 2,
        date: "2023-11-20",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "B3" },
        shootStatus: "Competition" // Not record status
      }
    ];

    const result = calculateClassificationProgress(
      history, "recurve", "A1", "indoor", "2023-10-01"
    );

    expect(result.nextClassification).toBe("B3");
    // Both shoots should count regardless of status
    expect(result.dozenArrowsShot).toBe(10); // 5 + 5 dozen
    expect(result.qualifyingShoots.length).toBe(2);
  });

  it("correctly handles mixed classification levels with status requirements", () => {
    const history = [
      {
        id: 1,
        date: "2023-11-15",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "B3" },
        shootStatus: "Practice" // Not record status, but OK for B3
      },
      {
        id: 2,
        date: "2023-11-20",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "MB" },
        shootStatus: "Competition" // Not record status, not OK for MB
      },
      {
        id: 3,
        date: "2023-11-25",
        gameType: "portsmouth",
        scores: Array(60).fill(9),
        userProfile: { bowType: "recurve" },
        classification: { name: "MB" },
        shootStatus: "RecordStatus" // Record status, OK for MB
      }
    ];

    // Test for B3 progress
    const resultB3 = calculateClassificationProgress(
      history, "recurve", "A1", "indoor", "2023-10-01"
    );

    expect(resultB3.nextClassification).toBe("B3");
    // All shoots with B3 or higher should count
    expect(resultB3.qualifyingShoots.length).toBe(3);
    expect(resultB3.dozenArrowsShot).toBe(15); // 5 + 5 + 5 dozen

    // Test for MB progress
    const resultMB = calculateClassificationProgress(
      history, "recurve", "B1", "indoor", "2023-10-01"
    );

    expect(resultMB.nextClassification).toBe("MB");
    // Only MB shoots with record status should count
    expect(resultMB.qualifyingShoots.length).toBe(1);
    expect(resultMB.qualifyingShoots[0].id).toBe(3);
    expect(resultMB.dozenArrowsShot).toBe(5); // 5 dozen from one shoot
  });
});
