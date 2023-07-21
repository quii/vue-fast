export function addTopScoreIndicator(scoringHistory) {
    // Create a copy of the input object to avoid modifying the original data
    const scoringHistoryCopy = JSON.parse(JSON.stringify(scoringHistory));

    // Create an object to store the best scores for each distance
    const bestScoresByDistance = {};

    // Loop through the scoring history data to find the best scores for each distance
    for (const entry of scoringHistoryCopy) {
        const distance = entry.distance;
        const score = entry.score;

        // If the distance key doesn't exist in the object or the current score is higher, update the value
        if (!(distance in bestScoresByDistance) || score > bestScoresByDistance[distance]) {
            bestScoresByDistance[distance] = score;
        }
    }

    // Loop through the scoring history data and add the 'topScore' boolean field
    for (const entry of scoringHistoryCopy) {
        const distance = entry.distance;
        const score = entry.score;

        // Check if the current score is the best score for this distance
        entry.topScore = score === bestScoresByDistance[distance];
    }

    return scoringHistoryCopy;
}