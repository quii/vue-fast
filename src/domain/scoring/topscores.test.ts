import { describe, test, expect } from "vitest";
import { addTopScoreIndicator } from "@/domain/scoring/topscores";

describe("addTopScoreIndicator", () => {
  test("happy path", () => {
    const scoringHistory = [
      {
        "id": 1,
        "date": "2023-07-21",
        "score": 299,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 2,
        "date": "2023-07-20",
        "score": 242,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 3,
        "date": "2023-07-18",
        "score": 242,
        "gameType": "warwick 30",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      }
    ];

    const scoringHistoryWithTopScores = addTopScoreIndicator(scoringHistory);

    expect(scoringHistoryWithTopScores).toHaveLength(3);
    expect(scoringHistoryWithTopScores[0].topScore).toBeTruthy();
    expect(scoringHistoryWithTopScores[1].topScore).toBeFalsy();
    expect(scoringHistoryWithTopScores[2].topScore).toBeTruthy();
  });

  test("groups top scores by game type", () => {
    const scoringHistoryInDifferentGameTypes = [
      {
        "id": 1,
        "date": "2023-07-21",
        "score": 299,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 2,
        "date": "2023-07-20",
        "score": 242,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 3,
        "date": "2023-07-18",
        "score": 242,
        "gameType": "national 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      }
    ];
    const scoringHistoryWithTopScores = addTopScoreIndicator(scoringHistoryInDifferentGameTypes);
    expect(scoringHistoryWithTopScores).toHaveLength(3);
    expect(scoringHistoryWithTopScores[0].topScore).toBeTruthy();
    expect(scoringHistoryWithTopScores[1].topScore).toBeFalsy();
    expect(scoringHistoryWithTopScores[2].topScore).toBeTruthy();
  });

  test("excludes practice rounds from top score indicators", () => {
    const scoringHistoryWithPractice = [
      {
        "id": 1,
        "date": "2023-07-21",
        "score": 299,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 2,
        "date": "2023-07-20",
        "score": 350, // Higher score but in practice
        "gameType": "practice 40yd",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 3,
        "date": "2023-07-19",
        "score": 280,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 4,
        "date": "2023-07-18",
        "score": 400, // Another practice round
        "gameType": "practice 50m",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      }
    ];

    const scoringHistoryWithTopScores = addTopScoreIndicator(scoringHistoryWithPractice);

    expect(scoringHistoryWithTopScores).toHaveLength(4);

    // The warwick 40 with 299 should be marked as top score
    expect(scoringHistoryWithTopScores[0].topScore).toBeTruthy();

    // Practice rounds should not have topScore property set
    expect(scoringHistoryWithTopScores[1].topScore).toBeUndefined();

    // The other warwick 40 should not be marked as top score
    expect(scoringHistoryWithTopScores[2].topScore).toBeFalsy();

    // The other practice round should not have topScore property set
    expect(scoringHistoryWithTopScores[3].topScore).toBeUndefined();
  });

  // New test for bow type separation
  test("separates top scores by bow type", () => {
    const scoringHistoryWithDifferentBowTypes = [
      {
        "id": 1,
        "date": "2023-07-21",
        "score": 299,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 2,
        "date": "2023-07-20",
        "score": 242,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "recurve" }
      },
      {
        "id": 3,
        "date": "2023-07-19",
        "score": 220,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "barebow" }
      },
      {
        "id": 4,
        "date": "2023-07-18",
        "score": 200,
        "gameType": "warwick 40",
        "scores": [/* scores here */],
        "userProfile": { "bowType": "barebow" }
      }
    ];

    const scoringHistoryWithTopScores = addTopScoreIndicator(scoringHistoryWithDifferentBowTypes);

    expect(scoringHistoryWithTopScores).toHaveLength(4);

    // The recurve warwick 40 with 299 should be marked as top score
    expect(scoringHistoryWithTopScores[0].topScore).toBeTruthy();

    // The recurve warwick 40 with 242 should not be marked as top score
    expect(scoringHistoryWithTopScores[1].topScore).toBeFalsy();

    // The barebow warwick 40 with 220 should be marked as top score
    expect(scoringHistoryWithTopScores[2].topScore).toBeTruthy();

    // The barebow warwick 40 with 200 should not be marked as top score
    expect(scoringHistoryWithTopScores[3].topScore).toBeFalsy();
  });
});
