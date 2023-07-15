import { GOLD, MISS } from "@/domain/scores";

export function calculateSubtotals(scores) {
  return {
    hits: calculateHitsCount(scores),
    totalScore: calculateTotal(scores),
    golds: calculateGoldCount(scores)
  };
}

export function calculateTotal(scores) {
  return getHits(scores).reduce((totalScore, score) => totalScore + score, 0);
}

function calculateGoldCount(scores) {
  return scores.reduce((total, score) => {
    if (score === GOLD) {
      return total + 1;
    }
    return total;
  }, 0);
}

function calculateHitsCount(scores) {
  return getHits(scores).length;
}

function getHits(scores) {
  return scores.filter((score) => score !== MISS);
}