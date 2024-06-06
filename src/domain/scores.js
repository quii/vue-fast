export const MISS = "M";
export const X = "X";

export function convertToValue(score, gameType = "national") {
  if (gameType === "worcester" && score === "X") {
    return 5;
  }
  return scoreMappings[score] ?? score;
}

export function convertToValues(scores) {
  return scores.filter(score => score !== MISS).map(convertToValue);
}

const scoreMappings = {
  X: 10,
  MISS: 0,
  "M": 0
};
