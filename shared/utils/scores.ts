const scoreMappings = {
  X: 10,
  MISS: 0,
  "M": 0
};

export function convertToValue(score: number | string, gameType?: string): number {
  if (gameType?.toLowerCase().includes('worcester') && score === 'X') {
    return 5;
  }
  return (scoreMappings as any)[score] ?? score;
}

export function convertToValues(scores: (number | string)[], gameType: string = "national"): number[] {
  return scores.filter(score => score !== "M").map(score => convertToValue(score, gameType));
}
