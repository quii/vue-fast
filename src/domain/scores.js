export const X = "X";
export const MISS = "M";
export const validImperialScores = [9, 7, 5, 3, 1, MISS];
export const validMetricScores = [X, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
export const indoorMetricScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS];
export const scoresPerEnd = 6;
export const endsPerRound = 2;
export const scoreMappings = {
  X: 10,
  M: 0
};

export function convertToValue(score) {
  return scoreMappings[score] ?? score;
}