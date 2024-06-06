import { convertToValues } from "@/domain/scores";

export function calculateSubtotals(scores, gameType) {
  const scoreValues = convertToValues(scores, gameType);

  const totalScore = calculateTotal(scoreValues);
  return {
    hits: scoreValues.length,
    totalScore: totalScore,
    golds: calculateGoldCount(scoreValues),
    X: calculateXCount(scores),
    onTrackFor252: totalScore >= 84
  };
}

export function calculateTotal(scores) {
  return scores
    .reduce((totalScore, score) => totalScore + score, 0);
}

function calculateGoldCount(scores) {
  return scores.filter(score => score > 8).length;
}

function calculateXCount(scoreValues) {
  return scoreValues.filter(score => score === "X").length;
}

