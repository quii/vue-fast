import { GOLD, MISS } from "@/domain/scores";

export function calculateSubtotals(scores) {
  return {
    hits: calculateHits(scores),
    totalScore: calculateTotal(scores),
    golds: calculateGoldCount(scores)
  };
}

export function calculateTotal(scores) {
  return scores.filter((score) => score !== MISS).reduce((totalScore, score) => totalScore + score, 0);
}

function calculateHits(scores) {
  return scores.filter((score) => score !== MISS).length;
}

function calculateGoldCount(scores) {
  return scores.reduce((total, score) => {
    if (score === GOLD) {
      return total + 1;
    }
    return total;
  }, 0);
}

