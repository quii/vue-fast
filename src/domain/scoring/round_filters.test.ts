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
    it('should filter rounds by name when search query is provided, ignoring other filters', () => {
      const filters: GameTypeFilters = {
        showIndoor: false, // This would normally exclude indoor rounds
        showOutdoor: false, // This would normally exclude outdoor rounds
        showMetric: false, // This would normally exclude metric rounds
        showImperial: false, // This would normally exclude imperial rounds
        showPractice: false, // This would normally exclude practice rounds
        maxDistance: 0, // This would normally exclude all rounds
        searchQuery: 'bray',
        minDistance: 100 // This would normally exclude all rounds
      };

      // Despite all other filters that would exclude everything,
      // we should still get "Bray I" because searchQuery is the only filter that matters
      expect(testFilterRounds(allRounds, filters)).toEqual(['Bray I'])
    });

    it('should handle case-insensitive search, ignoring other filters', () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: true,
        showMetric: false,
        showImperial: true,
        showPractice: false,
        maxDistance: 50, // This would normally exclude National
        searchQuery: 'national',
        minDistance: 0
      };

      // Despite maxDistance filter that would exclude National,
      // we should still get it because searchQuery is the only filter that matters
      expect(testFilterRounds(allRounds, filters)).toEqual(['National'])
    });

    it('should return all matching rounds for search query regardless of other filters', () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: false,
        showMetric: false,
        showImperial: false,
        showPractice: false,
        maxDistance: 0,
        searchQuery: 'a', // Matches National, Bray I, Practice Round, WA 70m
        minDistance: 100
      };

      // All rounds contain "a", so all should be returned despite other restrictive filters
      expect(testFilterRounds(allRounds, filters)).toEqual(['National', 'Bray I', 'Practice Round', 'WA 70m'])
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 100,
        minDistance: 0
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
        maxDistance: 50,
        minDistance: 0
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
        maxDistance: 60,
        minDistance: 0
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
        maxDistance: 10,
        minDistance: 0
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
        maxDistance: 60,
        minDistance: 0
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
        minDistance: 0,
        searchQuery: "a"  // Matches National, Bray I, WA 70m
      };

      // Should match rounds with 'a' that aren't practice rounds
      expect(testFilterRounds(allRounds, filters)).toEqual(['National', 'Bray I', 'Practice Round', 'WA 70m'])
    });
  });

  describe("minimum distance filtering", () => {
    it("should filter rounds by minimum distance", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        minDistance: 50,
        searchQuery: ""
      };

      // Should only return rounds with distances >= 50 yards (National and WA 70m)
      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "WA 70m"]);
    });

    it("should include rounds with exactly the minimum distance", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        minDistance: 60,
        searchQuery: ""
      };

      // Should include National which is exactly 60 yards
      expect(testFilterRounds(allRounds, filters)).toContain("National");
      expect(testFilterRounds(allRounds, filters)).not.toContain("Bray I");
    });

    it("should return no rounds when min distance is too high", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        minDistance: 80,
        searchQuery: ""
      };

      // No rounds have distances >= 80 yards
      expect(testFilterRounds(allRounds, filters)).toEqual([]);
    });

    it("should work correctly with maxDistance filter", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 70,
        minDistance: 30,
        searchQuery: ""
      };

      // Should only return National (between 30 and 70 yards)
      expect(testFilterRounds(allRounds, filters)).toEqual(["National"]);
    });

    it("should allow minDistance of 0 to include all rounds", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        minDistance: 0,
        searchQuery: ""
      };

      // Should include all non-practice rounds
      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "Bray I", "WA 70m"]);
    });
  });

  describe("combined filtering with minDistance", () => {
    it("should apply minDistance with other filters", () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: true,
        showMetric: false,
        showImperial: true,
        showPractice: false,
        maxDistance: 100,
        minDistance: 50,
        searchQuery: ""
      };

      // Should only return National (outdoor, imperial, not practice, >= 50 yards)
      expect(testFilterRounds(allRounds, filters)).toEqual(["National"]);
    });

    it("should handle search query with distance range filters", () => {
      const filters: GameTypeFilters = {
        showIndoor: true,
        showOutdoor: true,
        showMetric: true,
        showImperial: true,
        showPractice: false,
        maxDistance: 80,
        minDistance: 30,
      };

      // Should match rounds with 'a' that are between 30-80 yards and aren't practice rounds
      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "WA 70m"]);
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
        maxDistance: 100,
        minDistance: 0
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
        searchQuery: undefined,
        minDistance: 0
      };

      expect(testFilterRounds(allRounds, filters)).toEqual(["National", "Bray I", "WA 70m"]);
    });
  });

  describe('combined filtering with search query', () => {
    it('should ignore all other filters when search query is provided', () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: false,
        showMetric: false,
        showImperial: false,
        showPractice: false,
        maxDistance: 0,
        minDistance: 100,
        searchQuery: 'wa'
      }

      // Despite all filters being set to exclude everything,
      // "WA 70m" should still be returned because it matches the search query
      expect(testFilterRounds(allRounds, filters)).toEqual(['WA 70m'])
    })

    it('should apply all filters normally when search query is empty', () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: true,
        showMetric: false,
        showImperial: true,
        showPractice: false,
        maxDistance: 60,
        minDistance: 0,
        searchQuery: ''
      }

      // Should only return National (outdoor, imperial, not practice, max 60 yards)
      expect(testFilterRounds(allRounds, filters)).toEqual(['National'])
    })

    it('should apply all filters normally when search query is undefined', () => {
      const filters: GameTypeFilters = {
        showIndoor: false,
        showOutdoor: true,
        showMetric: false,
        showImperial: true,
        showPractice: false,
        maxDistance: 60,
        minDistance: 0,
        searchQuery: undefined
      }

      // Should only return National (outdoor, imperial, not practice, max 60 yards)
      expect(testFilterRounds(allRounds, filters)).toEqual(['National'])
    })
  })
});
