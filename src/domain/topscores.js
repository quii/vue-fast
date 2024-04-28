export function addTopScoreIndicator(scoringHistory) {
    // Create a copy of the input object to avoid modifying the original data
    const scoringHistoryCopy = JSON.parse(JSON.stringify(scoringHistory));

    // Create an object to store the best scores for each game type at each distance
    const bestScoresByDistanceAndGameType = {};

    // Loop through the scoring history data to find the best scores for each distance and game type
    for (const entry of scoringHistoryCopy) {
        const distance = 0;
        const gameType = entry.gameType;
        const score = entry.score;

        if (!bestScoresByDistanceAndGameType[distance]) {
            bestScoresByDistanceAndGameType[distance] = {};
        }

        if (!bestScoresByDistanceAndGameType[distance][gameType] || score > bestScoresByDistanceAndGameType[distance][gameType]) {
            bestScoresByDistanceAndGameType[distance][gameType] = score;
        }
    }

    // Loop through the scoring history data and add the 'topScore' boolean field
    for (const entry of scoringHistoryCopy) {
        const distance = 0;
        const gameType = entry.gameType;
        const score = entry.score;

        // Check if the current score is the best score for this distance and game type
        entry.topScore = score === bestScoresByDistanceAndGameType[distance][gameType];
    }

    return scoringHistoryCopy;
}