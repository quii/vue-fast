import { GOLD, MISS } from "@/domain/scores";

export function calculateSubtotals(scores) {
  return {
    hits: calculateHits(scores),
    totalScore: calculateTotal(scores),
    golds: calculateGoldCount(scores)
  };
}

export function calculateTotal(scores) {
  return scores
    .map(convertXto10)
    .filter(notMiss)
    .reduce((totalScore, score) => totalScore + score, 0);
}

function calculateHits(scores) {
  return scores.filter((score) => score !== MISS).length;
}

function calculateGoldCount(scores) {
  return scores.reduce((total, score) => {
    if (score === GOLD || score === "X" || score === 10) {
      return total + 1;
    }
    return total;
  }, 0);
}

function convertXto10(score) {
  if (score === "X") {
    return 10;
  }
  return score;
}

function notMiss(score) {
  return score !== MISS;
}

