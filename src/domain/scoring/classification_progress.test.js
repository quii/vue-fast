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
          classification: { name: "GMB" }
        }
      ];

      const result = calculateClassificationProgress(
        history, "recurve", "GMB", "indoor", "2023-10-01"
      );

      expect(result.dozenArrowsShot).toBe(0);
      expect(result.dozenArrowsRequired).toBe(0);
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
          scores: Array(48).fill(9),
          userProfile: { bowType: "barebow" },
          classification: { name: "B3" }
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
      expect(result.barebow.outdoor.dozenArrowsShot).toBe(4);
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
