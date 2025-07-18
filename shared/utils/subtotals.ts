export function calculateTotal(scoreValues: number[]): number {
  return scoreValues.reduce((total, score) => total + score, 0);
}
