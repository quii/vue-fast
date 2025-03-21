import { describe, it, expect } from "vitest";
import { calculateDefaultSeasonDates, isIndoorSeason, isOutdoorSeason } from "@/domain/season_dates";

describe("Season Dates", () => {
  it("should calculate correct default season dates in January", () => {
    // Mock January 15, 2023
    const RealDate = global.Date;
    const mockDate = new Date(2023, 0, 15);
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return mockDate;
        }
        return new RealDate(...args);
      }

      static now() {
        return mockDate.getTime();
      }
    };

    const seasonDates = calculateDefaultSeasonDates();
    expect(seasonDates.indoor).toBe("2022-10-01");
    expect(seasonDates.outdoor).toBe("2023-04-01");

    global.Date = RealDate;
  });

  it("should calculate correct default season dates in November", () => {
    // Mock November 15, 2023
    const RealDate = global.Date;
    const mockDate = new Date(2023, 10, 15);
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return mockDate;
        }
        return new RealDate(...args);
      }

      static now() {
        return mockDate.getTime();
      }
    };

    const seasonDates = calculateDefaultSeasonDates();
    expect(seasonDates.indoor).toBe("2023-10-01");
    expect(seasonDates.outdoor).toBe("2023-04-01");

    global.Date = RealDate;
  });

  it("should correctly identify dates in indoor season", () => {
    const indoorSeasonStart = "2022-10-01";

    // Dates within indoor season (October to March)
    expect(isIndoorSeason("2022-10-15", indoorSeasonStart)).toBe(true);
    expect(isIndoorSeason("2022-12-25", indoorSeasonStart)).toBe(true);
    expect(isIndoorSeason("2023-03-15", indoorSeasonStart)).toBe(true);

    // Dates outside indoor season
    expect(isIndoorSeason("2022-09-30", indoorSeasonStart)).toBe(false);
    expect(isIndoorSeason("2023-04-01", indoorSeasonStart)).toBe(false);
    expect(isIndoorSeason("2023-07-15", indoorSeasonStart)).toBe(false);
  });

  it("should correctly identify dates in outdoor season", () => {
    const outdoorSeasonStart = "2023-04-01";

    // Dates within outdoor season (April to September)
    expect(isOutdoorSeason("2023-04-15", outdoorSeasonStart)).toBe(true);
    expect(isOutdoorSeason("2023-06-25", outdoorSeasonStart)).toBe(true);
    expect(isOutdoorSeason("2023-09-15", outdoorSeasonStart)).toBe(true);

    // Dates outside outdoor season
    expect(isOutdoorSeason("2023-03-31", outdoorSeasonStart)).toBe(false);
    expect(isOutdoorSeason("2023-10-01", outdoorSeasonStart)).toBe(false);
    expect(isOutdoorSeason("2023-12-15", outdoorSeasonStart)).toBe(false);
  });
});
