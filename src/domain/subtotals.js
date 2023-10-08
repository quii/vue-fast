import { convertToValues } from "@/domain/scores";

export function calculateSubtotals(scores) {
  const scoreValues = convertToValues(scores);

  return {
    hits: scoreValues.length,
    totalScore: calculateTotal(scoreValues),
    golds: calculateGoldCount(scoreValues),
    X: calculateXCount(scores)
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

