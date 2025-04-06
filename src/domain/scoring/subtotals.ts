import { convertToValues } from "@/domain/scoring/scores";
import { gameTypeConfig } from "@/domain/scoring/game_types";

export function calculateSubtotals(scores, gameType) {
  const scoreValues = convertToValues(scores, gameType);

  const totalScore = calculateTotal(scoreValues);
  return {
    hits: scoreValues.length,
    totalScore: totalScore,
    golds: calculateGolds(scoreValues, gameType),
    X: calculateXCount(scores),
    onTrackFor252: totalScore >= 84
  };
}

export function calculateTotal(scores) {
  return scores
    .reduce((totalScore, score) => totalScore + score, 0);
}

function calculateGolds(scores, gameType) {
  const goldsThreshold = gameTypeConfig[gameType].isImperial ? 9 : 10;
  return scores.filter(score => score >= goldsThreshold).length;
}

function calculateXCount(scoreValues) {
  return scoreValues.filter(score => score === "X").length;
}

