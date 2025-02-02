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
        "scores": [/* scores here */]
      },
      {
        "id": 2,
        "date": "2023-07-20",
        "score": 242,
        "gameType": "warwick 40",
        "scores": [/* scores here */]
      },
      {
        "id": 3,
        "date": "2023-07-18",
        "score": 242,
        "gameType": "warwick 30",
        "scores": [/* scores here */]
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
        "scores": [/* scores here */]
      },
      {
        "id": 2,
        "date": "2023-07-20",
        "score": 242,
        "gameType": "warwick 40",
        "scores": [/* scores here */]
      },
      {
        "id": 3,
        "date": "2023-07-18",
        "score": 242,
        "gameType": "national 40",
        "scores": [/* scores here */]
      }
    ];
    const scoringHistoryWithTopScores = addTopScoreIndicator(scoringHistoryInDifferentGameTypes);
    expect(scoringHistoryWithTopScores).toHaveLength(3);
    expect(scoringHistoryWithTopScores[0].topScore).toBeTruthy();
    expect(scoringHistoryWithTopScores[1].topScore).toBeFalsy();
    expect(scoringHistoryWithTopScores[2].topScore).toBeTruthy();

  });
});