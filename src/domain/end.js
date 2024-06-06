import { convertToValue } from "@/domain/scores";
import { gameTypeConfig } from "@/domain/game_types";

export function calculateScoreIsValidForEnd(scores, gameType) {
    return (score) => {
        const gameTypeConf = gameTypeConfig[gameType];
        let endSize = gameTypeConf.endSize;
        if (!gameTypeConf?.isOutdoor && gameType !== "worcester") {
            endSize = 3;
        }

        const lowestScore = getLowestScoreForRecentEnd(scores, endSize);
        if (score === "X" && lowestScore <= 10) {
            return false;
        }
        const scoreValue = convertToValue(score, gameType);
        return Number(scoreValue) <= Number(lowestScore);
    };
}

function getLowestScoreForRecentEnd(scores, endSize = 6, gameType) {
    const scoresAsValues = scores.map(convertXToInfinity).map(x => convertToValue(x, gameType));
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