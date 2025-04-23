import { convertToValues } from "@/domain/scoring/scores";
import { roundConfigManager } from '@/domain/scoring/game_types'
import { Round } from '@/domain/scoring/round/round'

export interface Subtotals {
  hits: number;
  totalScore: number;
  golds: number;
  X: number;
  onTrackFor252: boolean;
}

export function calculateSubtotals(scores: (number | string)[], gameType: string): Subtotals {
  const scoreValues = convertToValues(scores, gameType);
  const round = roundConfigManager.getRound(gameType)

  if (!round) {
    throw new Error(`Unknown game type: ${gameType}`)
  }

  const totalScore = calculateTotal(scoreValues);
  return {
    hits: scoreValues.length,
    totalScore: totalScore,
    golds: calculateGolds(scoreValues, round, gameType),
    X: calculateXCount(scores),
    onTrackFor252: totalScore >= 84
  };
}

export function calculateTotal(scores: number[]): number {
  return scores.reduce((totalScore, score) => totalScore + score, 0)
}

function calculateGolds(scores: number[], round: Round, gameType: string): number {
  if (gameType.toLowerCase().includes('worcester')) {
    const worcesterGoldsThreshold = 5
    return scores.filter(score => score >= worcesterGoldsThreshold).length
  }

  const goldsThreshold = round.isImperial ? 9 : 10
  return scores.filter(score => score >= goldsThreshold).length;
}

function calculateXCount(scoreValues: (number | string)[]): number {
  return scoreValues.filter(score => score === "X").length;
}
