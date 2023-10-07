import { convertToValue, MISS } from "@/domain/scores";

export function calculateSubtotals(scores) {
  const scoreValues = scores
    .filter(score => score !== MISS)
    .map(convertToValue);

  return {
    hits: scoreValues.length,
    totalScore: calculateTotal(scoreValues),
    golds: calculateGoldCount(scoreValues)
  };
}

export function calculateTotal(scores) {
  return scores
    .reduce((totalScore, score) => totalScore + score, 0);
}

function calculateGoldCount(scores) {
  return scores.filter(score => score > 8).length;
}

