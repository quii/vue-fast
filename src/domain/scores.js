export const MISS = "M";
export const validImperialScores = [9, 7, 5, 3, 1, MISS];
export const validMetricScores = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
export const indoorMetricScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];

export function convertToValue(score) {
  return scoreMappings[score] ?? score;
}

export function convertToValues(scores) {
  return scores.filter(score => score !== MISS).map(convertToValue);
}

const scoreMappings = {
  "X": 10,
  MISS: 0,
  "M": 0
};
