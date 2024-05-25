import { convertToValue } from "@/domain/scores";
import { gameTypeConfig } from "@/domain/game_types";

export function calculateScoreIsValidForEnd(scores, endSize, gameType) {
    return (score) => {
        const isIndoor = !gameTypeConfig[gameType]?.isOutdoor;
        if (isIndoor) {
            endSize = 3;
        }
        const lowestScore = getLowestScoreForRecentEnd(scores, endSize);
        if (score === "X" && lowestScore <= 10) {
            return false;
        }
        const scoreValue = convertToValue(score);
        return Number(scoreValue) <= Number(lowestScore);
    };
}

function getLowestScoreForRecentEnd(scores, endSize = 6) {
    const scoresAsValues = scores.map(convertXToInfinity).map(convertToValue);
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

function convertXToInfinity(score) {
    if (score === "X") {
        return Infinity;
    }
    return score;
}