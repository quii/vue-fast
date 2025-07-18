import { convertToValues } from "@/domain/scoring/scores";
import { roundConfigManager } from '@/domain/scoring/game_types';
export function calculateSubtotals(scores, gameType) {
    const scoreValues = convertToValues(scores, gameType);
    const round = roundConfigManager.getRound(gameType);
    if (!round) {
        throw new Error(`Unknown game type: ${gameType}`);
    }
    const totalScore = calculateTotal(scoreValues);
    return {
        hits: scoreValues.length,
        totalScore: totalScore,
        golds: calculateGolds(scoreValues, round, gameType),
        X: calculateXCount(scores),
        onTrackFor252: totalScore >= 84
    };
}
export function calculateTotal(scores) {
    return scores.reduce((totalScore, score) => totalScore + score, 0);
}
function calculateGolds(scores, round, gameType) {
    if (gameType.toLowerCase().includes('worcester')) {
        const worcesterGoldsThreshold = 5;
        return scores.filter(score => score >= worcesterGoldsThreshold).length;
    }
    const goldsThreshold = round.isImperial ? 9 : 10;
    return scores.filter(score => score >= goldsThreshold).length;
}
function calculateXCount(scoreValues) {
    return scoreValues.filter(score => score === "X").length;
}
