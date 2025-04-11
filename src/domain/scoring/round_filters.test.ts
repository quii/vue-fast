import { describe, expect, it } from "vitest";
import { createRoundFilter, GameTypeFilters } from "./round_filters";

describe("round filters", () => {
  const testConfig = {
    "national": {
      isOutdoor: true,
      isImperial: true,
      isPracticeRound: false,
      maxDistanceYards: 60
    },
    "bray i": {
      isOutdoor: false,
      isImperial: false,
      isPracticeRound: false,
      maxDistanceYards: 20
    },
    "practice round": {
      isOutdoor: true,
      isImperial: true,
      isPracticeRound: true,
      maxDistanceYards: 40
    },
    "wa 70m": {
      isOutdoor: true,
      isImperial: false,
      isPracticeRound: false,
      maxDistanceYards: 77
    }
  };

  // Create a test instance with our test config
  const testFilterRounds = createRoundFilter(testConfig);

  // Sample round names that match our test config
  const allRounds = ["National", "Bray I", "Practice Round", "WA 70m"];

  describe("search filtering", () => {
    it("should filter rounds by name when search query is provided", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        searchQuery: "national"
      };
      expect(testFilterRounds(allRounds, filters)).toEqual(["National"]);
    });

    it("should handle case-insensitive search", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        searchQuery: "bray"
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["Bray I"]);
    });

    it("should return all non-practice rounds when search query is empty", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        searchQuery: ""
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "Bray I", "WA 70m"]);
    });
  });

  describe("environment filtering", () => {
    it("should filter indoor rounds only", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: false,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["Bray I"]);
    });

    it("should filter outdoor rounds only", () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "WA 70m"]);
    });

    it("should return no rounds when neither indoor nor outdoor is selected", () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: false,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100
      };

      expect(testFilterRounds(allRounds, filters)).toEqual([]);
    });
  });

  describe("unit system filtering", () => {
    it("should filter metric rounds only", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: false,
        showPractice: false,
        maxDistance: 100
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["Bray I", "WA 70m"]);
    });

    it("should filter imperial rounds only", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: false,
        showImperial: true,
        showPractice: false,
        maxDistance: 100
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["National"]);
    });
  });

  describe("practice round filtering", () => {
    it("should include only practice rounds when showPractice is true", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: true,
        maxDistance: 100
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["Practice Round"]);
    });

    it("should exclude practice rounds when showPractice is false", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100
      };

      const result = testFilterRounds(allRounds, filters);
      expect(result).not.toContain("Practice Round");
      expect(result).toEqual(["National", "Bray I", "WA 70m"]);
    });
  });

  describe("distance filtering", () => {
    it("should filter rounds by maximum distance", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 50
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["Bray I"]);
    });

    it("should include rounds with exactly the maximum distance", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 60
      };

      expect(testFilterRounds(allRounds, filters)).toContain("National");
    });

    it("should return no rounds when max distance is too low", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 10
      };

      expect(testFilterRounds(allRounds, filters)).toEqual([]);
    });
  });

  describe("combined filtering", () => {
    it("should apply all filters together", () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: true,
        showMetric: false,
        showImperial: true,
        showPractice: false,
        maxDistance: 60
      };

      // Should only return National (outdoor, imperial, not practice, max 60 yards)
      expect(testFilterRounds(allRounds, filters)).toEqual(["National"]);
    });

    it("should handle search query with other filters", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        searchQuery: "a"  // Matches National, Bray I, WA 70m
      };

      // Should match rounds with 'a' that aren't practice rounds
      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "Bray I", "WA 70m"]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty input array", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100
      };

      expect(testFilterRounds([], filters)).toEqual([]);
    });

    it("should handle undefined search query", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        searchQuery: undefined
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "Bray I", "WA 70m"]);
    });
  });
});
