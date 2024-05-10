import { convertToValue } from "@/domain/scores";

export function calculateScoreIsValidForEnd(scores, endSize) {
    return (score) => {
        const lowestScore = getLowestScoreForRecentEnd(scores, endSize);
        const scoreValue = convertToValue(score);
        return scoreValue <= lowestScore;
    };
}

function getLowestScoreForRecentEnd(scores, endSize = 6) {
    const scoresAsValues = scores.map(convertToValue);
    const recentEndIndex = scoresAsValues.length % endSize;

    if(recentEndIndex===0) {
        return Infinity
    }

    const recentEndScores = scoresAsValues.slice(-recentEndIndex);

    let minScore = Infinity;
    for (let i = 0; i < recentEndScores.length; i++) {
        if (recentEndScores[i] < minScore) {
            minScore = recentEndScores[i];
        }
    }

    return minScore;
}
