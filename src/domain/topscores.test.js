import { test, expect} from "vitest";
import {addTopScoreIndicator} from "@/domain/topscores";

test('addTopScoreIndicator', () => {
    const scoringHistory = [
        {"id": 1, "date": "2023-07-21", "score": 299, "distance": 40, "gameType": "warwick", "scores": [/* scores here */]},
        {"id": 2, "date": "2023-07-20", "score": 242, "distance": 40, "gameType": "warwick", "scores": [/* scores here */]},
        {"id": 3, "date": "2023-07-18", "score": 242, "distance": 30, "gameType": "warwick", "scores": [/* scores here */]}
    ];

    const scoringHistoryWithTopScores = addTopScoreIndicator(scoringHistory);

    expect(scoringHistoryWithTopScores).toHaveLength(3)
    expect(scoringHistoryWithTopScores[0].topScore).toBeTruthy()
    expect(scoringHistoryWithTopScores[1].topScore).toBeFalsy()
    expect(scoringHistoryWithTopScores[2].topScore).toBeTruthy()
});