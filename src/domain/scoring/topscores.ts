export function addTopScoreIndicator(scoringHistory) {
    // Create a copy of the input object to avoid modifying the original data
    const scoringHistoryCopy = JSON.parse(JSON.stringify(scoringHistory));

    // Create an object to store the best scores for each game type and bow type
    const bestScoresByGameTypeAndBowType = {};

    // Loop through the scoring history data to find the best scores for each game type and bow type
    for (const entry of scoringHistoryCopy) {
        if (entry.gameType.toLowerCase().includes("practice")) {
            continue;
        }

        const gameType = entry.gameType;
        const score = entry.score;
        const bowType = entry.userProfile?.bowType || "unknown";

        if (!bestScoresByGameTypeAndBowType[gameType]) {
            bestScoresByGameTypeAndBowType[gameType] = {};
        }

        if (!bestScoresByGameTypeAndBowType[gameType][bowType] ||
          score > bestScoresByGameTypeAndBowType[gameType][bowType]) {
            bestScoresByGameTypeAndBowType[gameType][bowType] = score;
        }
    }

    // Loop through the scoring history data and add the 'topScore' boolean field
    for (const entry of scoringHistoryCopy) {
        if (entry.gameType.toLowerCase().includes("practice")) {
            continue;
        }

        const gameType = entry.gameType;
        const score = entry.score;
        const bowType = entry.userProfile?.bowType || "unknown";

        // Check if the current score is the best score for this game type and bow type
        entry.topScore = score === bestScoresByGameTypeAndBowType[gameType][bowType];
    }

    return scoringHistoryCopy;
}
