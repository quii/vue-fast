import { gameTypeConfig } from "@/domain/game_types";

export const MISS = "M";
export const X = "X";

export function convertToValue(score, gameType) {
  if (gameType === "worcester" && score === "X") {
    return 5;
  }
  return scoreMappings[score] ?? score;
}

export function convertToValues(scores, gameType = "national") {
  return scores.filter(score => score !== MISS).map(x => convertToValue(x, gameType));
}

const scoreMappings = {
  X: 10,
  MISS: 0,
  "M": 0
};

export function calculateMaxPossibleScore(totalScoreSoFar, arrowsRemaining, gameType) {
  return totalScoreSoFar + (arrowsRemaining * convertToValue(gameTypeConfig[gameType].scores[0]));
}