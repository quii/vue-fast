import { convertToValue } from "@/domain/scores";
import { gameTypeConfig } from "@/domain/game_types";

const MAX_SCORE = Infinity;

function convertScore(score, round) {
    if (score === "X") {
        return MAX_SCORE;
    }
    return convertToValue(score, round);
}

function getEndSize(round) {
    const roundConfig = gameTypeConfig[round];
    if (!roundConfig?.isOutdoor && round !== "worcester") {
        return 3;
    }
    return roundConfig.endSize;
}

function getLowestScoreForRecentEnd(scores, endSize = 6, round) {
    const scoresAsValues = scores.map(score => convertScore(score, round));
    const recentEndIndex = scoresAsValues.length % endSize;

    if (recentEndIndex === 0) {
        return MAX_SCORE;
    }

    return scoresAsValues
      .slice(-recentEndIndex)
      .reduce((min, score) => Math.min(min, score), MAX_SCORE);
}

export function calculateScoreIsValidForEnd(scores, round) {
    return (score) => {
        const endSize = getEndSize(round);
        const lowestScore = getLowestScoreForRecentEnd(scores, endSize);

        if (score === "X" && lowestScore <= 10) {
            return false;
        }

        const scoreValue = convertScore(score, round);
        return scoreValue <= lowestScore;
    };
}