import { createPlayerHistory, filterByShootStatus } from "@/domain/repositories/player_history.js";
import { classificationList } from "@/domain/scoring/classificationList.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

beforeEach(() => {
  global.fetch = vi.fn((path) => {
    // Check if the path is for the 50+ age group
    if (path.includes("/50+.json")) {
      return Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, gender: "Men", bowType: "Recurve", age: "50+", round: "windsor", score: 470 },
          { id: 2, gender: "Men", bowType: "Recurve", age: "50+", round: "windsor", score: 582 },
          { id: 3, gender: "Men", bowType: "Recurve", age: "50+", round: "windsor", score: 681 },
          { id: 4, gender: "Men", bowType: "Recurve", age: "50+", round: "windsor", score: 762 },
          // Add portsmouth round for 50+ age group
          { id: 5, gender: "Men", bowType: "Recurve", age: "50+", round: "portsmouth", score: 470 }
        ])
      });
    } else {
      // Return the original mock data for all other paths
      return Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 490 },
          { id: 2, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 602 },
          { id: 3, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 701 },
          { id: 4, gender: "Men", bowType: "Recurve", age: "Senior", round: "windsor", score: 782 },
          // Add portsmouth round for senior age group
          { id: 5, gender: "Men", bowType: "Recurve", age: "Senior", round: "portsmouth", score: 500 }
        ])
      });
    }
  });
});


describe("player history", () => {
  test("keeps records sorted by date (newest first) and adds top score indicator", async () => {
    const playerHistory = createPlayerHistory();

    // Use fixed dates with clear ordering
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-01-05');
    const date3 = new Date('2023-01-10');
    const date4 = new Date('2023-01-15');

    await playerHistory.add(date2, 456, 'national 50', [1, 2, 3], 'yd')
    await playerHistory.add(date3, 200, 'national 50', [1, 2, 3], 'yd')
    await playerHistory.add(date4, 123, 'national 50', [1, 2, 3], 'yd')
    await playerHistory.add(date1, 826, 'windsor 50', [1, 2, 3], 'yd')

    const sortedHistory = playerHistory.sortedHistory()
    expect(sortedHistory).toHaveLength(4);

    // Compare dates by converting both to timestamps
    expect(new Date(sortedHistory[0].date).getTime()).toEqual(date4.getTime());
    expect(sortedHistory[0].score).toEqual(123);
    expect(new Date(sortedHistory[1].date).getTime()).toEqual(date3.getTime());
    expect(sortedHistory[1].score).toEqual(200);
    expect(new Date(sortedHistory[2].date).getTime()).toEqual(date2.getTime());
    expect(sortedHistory[2].score).toEqual(456);
    expect(new Date(sortedHistory[3].date).getTime()).toEqual(date1.getTime());
    expect(sortedHistory[3].score).toEqual(826);

    // Check top score indicators
    expect(sortedHistory[0].topScore).toBeFalsy();
    expect(sortedHistory[1].topScore).toBeFalsy();
    expect(sortedHistory[2].topScore).toBeTruthy(); // Highest score for 'national 50'
    expect(sortedHistory[3].topScore).toBeTruthy(); // Highest score for 'windsor 50'
  });

  test('it can retrieve your personal best for a round', async () => {
    const playerHistory = createPlayerHistory();

    await playerHistory.add(new Date(), 456, 'national 50', [1, 2, 3], 'yd')
    await playerHistory.add(new Date(), 455, 'national 50', [1, 2, 3], 'yd')
    await playerHistory.add(new Date(), 826, 'windsor 50', [1, 2, 3], 'yd')

    expect(playerHistory.personalBest("national 50")).toEqual(456);
    expect(playerHistory.personalBest("windsor 50")).toEqual(826);
    expect(playerHistory.personalBest("frostbite")).toBeUndefined();
  });

  test('it can total up the number of arrows shot', async () => {
    const playerHistory = createPlayerHistory();
    await playerHistory.add(new Date(), 456, 'national 50', [1, 2, 3], 'yd')
    expect(playerHistory.totalArrows()).toEqual(3);
  });

  test("it can retreive your average score for a given round", async () => {
    const playerHistory = createPlayerHistory();
    const assumedEndSize = 6;

    // if shooting less than a full end, the average should assume you shot a full end
    const nineArrowsShot = [9, 9, 9, 9, 9, 9, 9, 9, 9];
    const sum9End = nineArrowsShot.reduce((sum, v) => sum + v, 0);
    const expected9Score = (sum9End / nineArrowsShot.length) * assumedEndSize;

    // if shooting more than a full end, the average should average the scores of the multiple ends
    const twelveArrowsShot = [9, 9, 9, 9, 9, 9, 1, 1, 1, 1, 1, 1];
    const sum12End = twelveArrowsShot.reduce((sum, v) => sum + v, 0);
    const expected12Score = (sum12End / twelveArrowsShot.length) * assumedEndSize;

    // Use different dates to ensure consistent sorting
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Add the shoots with different dates
    await playerHistory.add(today, sum9End, 'portsmouth', nineArrowsShot, 'yd')
    await playerHistory.add(yesterday, sum12End, 'practice 20yd', twelveArrowsShot, 'yd')

    const sortedHistory = playerHistory.sortedHistory()

    // Now we can be sure that the today's shoot will be first (index 0)
    // and yesterday's shoot will be second (index 1)
    expect(sortedHistory[0].averagePerEnd).toEqual(expected9Score);
    expect(sortedHistory[1].averagePerEnd).toEqual(expected12Score);
  });

  test('gets unique game types from recent games, ordered by most recent first', async () => {
    const playerHistory = createPlayerHistory();

    const now = new Date();
    const oneWeekAgo = new Date().addDays(-7);
    const twoWeeksAgo = new Date().addDays(-14);
    const sevenWeeksAgo = new Date().addDays(-49);

    await playerHistory.add(twoWeeksAgo, 200, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(oneWeekAgo, 300, 'windsor', [1, 2, 3], 'yd')
    await playerHistory.add(now, 100, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(sevenWeeksAgo, 400, 'york', [1, 2, 3], 'yd')

    const recentTypes = playerHistory.getRecentGameTypes();
    expect(recentTypes).toEqual(["national", "windsor"]);
  });

  test("filtered history - personal bests only", async () => {
    const playerHistory = createPlayerHistory();
    const user = { gender: "male", ageGroup: "senior", bowType: "recurve" };
    const bestNational = 200;
    const bestWindsor = 150;

    await playerHistory.add(new Date(), 100, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(new Date(), bestNational, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(new Date(), bestWindsor, 'windsor', [1, 2, 3], 'yd')

    const filtered = playerHistory.getFilteredHistory({ pbOnly: true }, user)

    expect(filtered.length).toBe(2);
    expect(filtered.every(score => score.topScore)).toBe(true);
    expect(filtered.map(s => ({ round: s.gameType, score: s.score }))).toEqual(
      expect.arrayContaining([{ round: "national", score: bestNational }, { round: "windsor", score: bestWindsor }])
    );
  });

  test("filtered history - by round", async () => {
    const playerHistory = createPlayerHistory();
    const user = { gender: "male", ageGroup: "senior", bowType: "recurve" };

    await playerHistory.add(new Date(), 100, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(new Date(), 200, 'windsor', [1, 2, 3], 'yd')

    const filters = { round: "national" };
    const filtered = playerHistory.getFilteredHistory(filters, user)

    expect(filtered.length).toBe(1);
    expect(filtered[0].gameType).toBe("national");
  });

  test("filtered history - by date range", async () => {
    const playerHistory = createPlayerHistory();
    const user = { gender: "male", ageGroup: "senior", bowType: "recurve" };

    const today = new Date();
    const lastWeek = new Date().addDays(-7);
    const twoWeeksAgo = new Date().addDays(-14);

    await playerHistory.add(today, 100, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(lastWeek, 200, 'national', [1, 2, 3], 'yd')
    await playerHistory.add(twoWeeksAgo, 300, 'national', [1, 2, 3], 'yd')

    const filters = {
      dateRange: {
        startDate: lastWeek,
        endDate: today
      }
    };
    const filtered = playerHistory.getFilteredHistory(filters, user)

    expect(filtered.length).toBe(2);
  });

  test("filtered history - by classification", async () => {
    const user = { gender: "male", ageGroup: "senior", bowType: "recurve" };
    const playerHistory = createPlayerHistory(undefined, user);

    await playerHistory.add(new Date(), 490, 'windsor', [1, 2, 3], 'yd', user)
    await playerHistory.add(new Date(), 100, 'windsor', [1, 2, 3], 'yd', user)

    const filters = { classification: "A3" };
    await playerHistory.backfillClassifications()
    const filtered = playerHistory.getFilteredHistory(filters)

    expect(filtered.length).toBe(1,
      `Expected to find 1 score with A3 classification. Found ${filtered.length} scores instead. Scores: ${JSON.stringify(filtered, null, 2)}`
    );

    if (filtered.length > 0) {
      expect(filtered[0].classification?.name).toBe("A3",
        `Expected classification A3 but got ${filtered[0].classification?.name}`
      );
    }
  });

  test("filtered history - combining multiple filters", async () => {
    const user = { gender: "male", ageGroup: "senior", bowType: "recurve" };
    const playerHistory = createPlayerHistory(undefined, user);

    const today = new Date();

    await playerHistory.add(today, 490, 'windsor', [1, 2, 3], 'yd', user)
    await playerHistory.add(today, 490, 'national', [1, 2, 3], 'yd', user)
    await playerHistory.add(today, 100, 'windsor', [1, 2, 3], 'yd', user)

    const filters = {
      round: "windsor",
      classification: "A3"
    };

    await playerHistory.backfillClassifications()
    const filtered = playerHistory.getFilteredHistory(filters)

    expect(filtered.length).toEqual(1,
      `Expected to find 1 score matching windsor round and A3 classification. Found ${filtered.length} scores instead. Scores: ${JSON.stringify(filtered, null, 2)}`
    );

    if (filtered.length > 0) {
      expect(filtered[0].gameType).toBe("windsor",
        `Expected round windsor but got ${filtered[0].gameType}`
      );
      expect(filtered[0].classification?.name).toBe("A3",
        `Expected classification A3 but got ${filtered[0].classification?.name}`
      );
    }
  });
});

describe("Classification with changing age groups", () => {
  test("classifications should be based on historical profile, not current profile", async () => {

    const seniorProfile = {
      gender: "male",
      ageGroup: "senior",
      bowType: "recurve",
      classification: "B3"
    };

    const playerHistory = createPlayerHistory(undefined, seniorProfile);

    // Add a shoot as a senior
    const seniorShootId = await playerHistory.add(
      "2023-01-01",
      500,
      "portsmouth",
      Array(60).fill(9), // 60 arrows of 9s
      "m",
      seniorProfile
    );

    // Get the history and check classification
    await playerHistory.backfillClassifications()

    let history = playerHistory.sortedHistory()
    const seniorShoot = history.find(item => item.id === seniorShootId);
    const seniorClassification = seniorShoot.classification?.name;

    // Now change to 50+ and add another shoot
    const veteranProfile = {
      gender: "male",
      ageGroup: "50+",
      bowType: "recurve",
      classification: "B3"
    };

    // Update the player history with the new profile
    const updatedPlayerHistory = createPlayerHistory(undefined, veteranProfile);

    // Add a shoot as a 50+
    const veteranShootId = await updatedPlayerHistory.add(
      "2023-06-01",
      500, // Same score
      "portsmouth", // Same round
      Array(60).fill(9), // Same arrows
      "m",
      veteranProfile
    );

    // Get the updated history
    await updatedPlayerHistory.backfillClassifications()
    history = updatedPlayerHistory.sortedHistory()

    // Find both shoots
    const historicalSeniorShoot = history.find(item => item.id === seniorShootId);
    const veteranShoot = history.find(item => item.id === veteranShootId);

    // The senior shoot should still have its original classification
    expect(historicalSeniorShoot.classification?.name).toBe(seniorClassification);

    // The veteran shoot should have a potentially different classification
    // (50+ typically has lower thresholds, so same score might achieve higher classification)
    expect(veteranShoot.classification?.name).not.toBeUndefined();

    // If the classifications for 50+ are indeed more lenient, this would be true
    // This might need adjustment based on your actual classification data
    if (seniorClassification !== "GMB") { // If not already at the top
      expect(
        classificationList.indexOf(veteranShoot.classification?.name) <=
        classificationList.indexOf(seniorClassification)
      ).toBe(true);
    }
  });
});

describe("getBowTypesUsed", () => {
  test('returns all bow types from history plus the current one', async () => {
    const playerHistory = createPlayerHistory();

    // Add scores with recurve bow type
    await playerHistory.add(new Date(), 456, 'national', [1, 2, 3], 'yd', {
      gender: "male",
      ageGroup: "senior",
      bowType: "recurve"
    });

    await playerHistory.add(new Date(), 500, 'windsor', [1, 2, 3], 'yd', {
      gender: "male",
      ageGroup: "senior",
      bowType: "recurve"
    });

    // Test with no current bow type - should only return recurve
    const bowTypesWithoutCurrent = playerHistory.getBowTypesUsed();
    expect(bowTypesWithoutCurrent).toEqual(["recurve"]);

    // Test with a different current bow type - should return both
    const bowTypesWithCurrent = playerHistory.getBowTypesUsed("barebow");
    expect(bowTypesWithCurrent).toContain("recurve");
    expect(bowTypesWithCurrent).toContain("barebow");
    expect(bowTypesWithCurrent.length).toBe(2);

    // Test with the same bow type - should not duplicate
    const bowTypesWithSame = playerHistory.getBowTypesUsed("recurve");
    expect(bowTypesWithSame).toEqual(["recurve"]);
    expect(bowTypesWithSame.length).toBe(1);
  });

  test("handles empty history", () => {
    const playerHistory = createPlayerHistory();

    // With no history and no current bow type
    const emptyResult = playerHistory.getBowTypesUsed();
    expect(emptyResult).toEqual([]);

    // With no history but with a current bow type
    const currentOnlyResult = playerHistory.getBowTypesUsed("compound");
    expect(currentOnlyResult).toEqual(["compound"]);
  });

  test("handles missing bow type in history items", () => {
    const storage = {
      value: [
        // Item with no userProfile
        { id: 1, date: new Date(), score: 100, gameType: "national" },
        // Item with userProfile but no bowType
        { id: 2, date: new Date(), score: 200, gameType: "windsor", userProfile: { gender: "male" } },
        // Item with proper bowType
        { id: 3, date: new Date(), score: 300, gameType: "york", userProfile: { bowType: "longbow" } }
      ]
    };

    const playerHistory = createPlayerHistory(storage);
    const result = playerHistory.getBowTypesUsed("recurve");

    // Should only include the valid bow type from history plus the current one
    expect(result).toContain("longbow");
    expect(result).toContain("recurve");
    expect(result.length).toBe(2);
  });
});

describe("Shoot Status", () => {
  test("it defaults to Practice when no shoot status is provided", async () => {
    const playerHistory = createPlayerHistory();

    // Add a shoot without specifying status
    await playerHistory.add(new Date(), 456, 'national', [1, 2, 3], 'yd')

    const history = playerHistory.sortedHistory()
    expect(history[0].shootStatus).toEqual("Practice");
  });

  test("it stores the provided shoot status", async () => {
    const playerHistory = createPlayerHistory();

    // Add shoots with different statuses
    await playerHistory.add(new Date(), 456, 'national', [1, 2, 3], 'yd', undefined, 'Competition')
    await playerHistory.add(new Date(), 500, 'windsor', [1, 2, 3], 'yd', undefined, 'RecordStatus')

    const history = playerHistory.sortedHistory()

    // Find the shoots by score
    const nationalShoot = history.find(item => item.score === 456);
    const windsorShoot = history.find(item => item.score === 500);

    expect(nationalShoot.shootStatus).toEqual("Competition");
    expect(windsorShoot.shootStatus).toEqual("RecordStatus");
  });

  test("it can filter history by shoot status", async () => {
    const playerHistory = createPlayerHistory();
    const user = { gender: "male", ageGroup: "senior", bowType: "recurve" };

    // Add shoots with different statuses
    await playerHistory.add(new Date(), 100, 'national', [1, 2, 3], 'yd', user, 'Practice')
    await playerHistory.add(new Date(), 200, 'national', [1, 2, 3], 'yd', user, 'Competition')
    await playerHistory.add(new Date(), 300, 'national', [1, 2, 3], 'yd', user, 'RecordStatus')

    // Add a filter for shoot status
    const filters = { shootStatus: "Competition" };
    const filtered = playerHistory.getFilteredHistory(filters, user)

    expect(filtered.length).toBe(1);
    expect(filtered[0].score).toEqual(200);
    expect(filtered[0].shootStatus).toEqual("Competition");
  });

  test('it can get all unique shoot statuses used in history', async () => {
    const playerHistory = createPlayerHistory();

    // Add shoots with different statuses
    await playerHistory.add(new Date(), 100, 'national', [1, 2, 3], 'yd', undefined, 'Practice')
    await playerHistory.add(new Date(), 200, 'windsor', [1, 2, 3], 'yd', undefined, 'Competition')
    await playerHistory.add(new Date(), 300, 'york', [1, 2, 3], 'yd', undefined, 'RecordStatus')
    await playerHistory.add(new Date(), 400, 'bray', [1, 2, 3], 'yd', undefined, 'Competition')

    const usedStatuses = playerHistory.getShootStatusesUsed();

    // Should contain all three statuses without duplicates
    expect(usedStatuses).toContain("Practice");
    expect(usedStatuses).toContain("Competition");
    expect(usedStatuses).toContain("RecordStatus");
    expect(usedStatuses.length).toBe(3);
  });
});

describe("filterByShootStatus", () => {
  test("returns all items when no status filter is applied", () => {
    const history = [
      { id: 1, date: "2023-01-01", score: 100, gameType: "national", scores: [], shootStatus: "Practice" },
      { id: 2, date: "2023-01-02", score: 200, gameType: "windsor", scores: [], shootStatus: "Competition" },
      { id: 3, date: "2023-01-03", score: 300, gameType: "york", scores: [] } // No status (legacy data)
    ];

    const filtered = filterByShootStatus(history, null);

    expect(filtered).toEqual(history);
    expect(filtered.length).toBe(3);
  });

  test("includes items with no status when filtering for Practice", () => {
    const history = [
      { id: 1, date: "2023-01-01", score: 100, gameType: "national", scores: [], shootStatus: "Practice" },
      { id: 2, date: "2023-01-02", score: 200, gameType: "windsor", scores: [], shootStatus: "Competition" },
      { id: 3, date: "2023-01-03", score: 300, gameType: "york", scores: [] } // No status (legacy data)
    ];

    const filtered = filterByShootStatus(history, "Practice");

    expect(filtered.length).toBe(2);
    expect(filtered).toContainEqual(history[0]); // Explicit Practice
    expect(filtered).toContainEqual(history[2]); // No status (treated as Practice)
  });

  test("only includes exact matches for non-Practice statuses", () => {
    const history = [
      { id: 1, date: "2023-01-01", score: 100, gameType: "national", scores: [], shootStatus: "Practice" },
      { id: 2, date: "2023-01-02", score: 200, gameType: "windsor", scores: [], shootStatus: "Competition" },
      { id: 3, date: "2023-01-03", score: 300, gameType: "york", scores: [] }, // No status (legacy data)
      { id: 4, date: "2023-01-04", score: 400, gameType: "bray", scores: [], shootStatus: "RecordStatus" }
    ];

    // Test Competition filter
    const filteredCompetition = filterByShootStatus(history, "Competition");
    expect(filteredCompetition.length).toBe(1);
    expect(filteredCompetition).toContainEqual(history[1]);

    // Test RecordStatus filter
    const filteredRecordStatus = filterByShootStatus(history, "RecordStatus");
    expect(filteredRecordStatus.length).toBe(1);
    expect(filteredRecordStatus).toContainEqual(history[3]);
  });

  test("handles empty history array", () => {
    const history = [];

    const filtered = filterByShootStatus(history, "Practice");

    expect(filtered).toEqual([]);
    expect(filtered.length).toBe(0);
  });
});

describe("location functionality", () => {
  test("adds score with location data when provided", async () => {
    const mockLocation = {
      latitude: 51.5074,
      longitude: -0.1278,
      placeName: 'Test Archery Club',
      timestamp: Date.now()
    };

    const mockLocationService = {
      getCurrentLocation: vi.fn().mockResolvedValue(mockLocation),
      getPlaceName: vi.fn()
    };

    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      mockLocationService
    );

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd'
    );

    expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.location).toEqual(mockLocation);
  });

  test("adds score without location data when not provided", async () => {
    const playerHistory = createPlayerHistory();

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd'
    );

    const shoot = playerHistory.getById(id as number);
    expect(shoot?.location).toBeUndefined();
  });

  test("add method captures location when service is available", async () => {
    const mockLocationService = {
      getCurrentLocation: vi.fn().mockResolvedValue({
        latitude: 51.5074,
        longitude: -0.1278,
        placeName: 'Test Archery Club',
        timestamp: Date.now()
      }),
      getPlaceName: vi.fn()
    };

    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      mockLocationService
    );

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd'
    );

    expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
    
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.location).toEqual(expect.objectContaining({
      latitude: 51.5074,
      longitude: -0.1278,
      placeName: 'Test Archery Club'
    }));
  });

  test("add method handles location service failure gracefully", async () => {
    const mockLocationService = {
      getCurrentLocation: vi.fn().mockResolvedValue(null),
      getPlaceName: vi.fn()
    };

    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      mockLocationService
    );

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd'
    );

    expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
    
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.location).toBeUndefined();
  });

  test("add method works when no location service is provided", async () => {
    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      null
    );

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd'
    );
    
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.location).toBeUndefined();
  });

  test("stores shoot duration when provided", async () => {
    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      null
    );

    const shootDuration = 45 * 60 * 1000; // 45 minutes in milliseconds

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd',
      undefined,
      'Practice',
      shootDuration
    );
    
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.shootDuration).toBe(45 * 60 * 1000); // 45 minutes in milliseconds
  });

  test("handles shoots without duration", async () => {
    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      null
    );

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd'
    );
    
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.shootDuration).toBeUndefined();
  });

  test("handles shoots without duration", async () => {
    const playerHistory = createPlayerHistory(
      { value: [] },
      null,
      { emit: vi.fn() },
      null
    );

    const id = await playerHistory.add(
      '2023-01-01',
      123,
      'national 50',
      [1, 2, 3],
      'yd',
      undefined,
      'Practice'
      // No shootDuration parameter
    );
    
    const shoot = playerHistory.getById(id as number);
    expect(shoot?.shootDuration).toBeUndefined();
  });
});
