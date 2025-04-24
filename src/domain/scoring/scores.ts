import { gameTypeConfig } from "@/domain/scoring/game_types";
import { MISS } from "@/domain/scoring/game_type_config";

const scoreMappings = {
  X: 10,
  MISS: 0,
  "M": 0
};

export function convertToValue(score, gameType) {
  if (gameType?.toLowerCase().includes('worcester') && score === 'X') {
    return 5;
  }
  return scoreMappings[score] ?? score;
}

export function convertToValues(scores, gameType = "national") {
  return scores.filter(score => score !== MISS).map(x => convertToValue(x, gameType));
}

export const calculateMaxPossibleScore = (totalScoreSoFar, arrowsRemaining, gameType) => {
  return totalScoreSoFar + (arrowsRemaining * convertToValue(gameTypeConfig[gameType].scores[0], gameType));
}
