import { convertToValue } from "@/domain/scores";

export function getLowestScoreForRecentEnd(scores) {
    const scoresAsValues = scores.map(convertToValue);
    const endSize = 6;
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


