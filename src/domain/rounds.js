import { splitIntoChunks } from "@/domain/splitter";
import { gameTypeConfig } from "@/domain/game_types";
import { calculateSubtotals, calculateTotal } from "@/domain/subtotals";
import { convertToValues } from "@/domain/scores";

export function calculateRounds(scores, gameType = "national", endSize = 6) {
  const { distancesRoundSizes } = gameTypeConfig[gameType];
  const rounds = [];
  let runningTotal = 0;

  for (const dozens of distancesRoundSizes) {
    const arrowsPerDistance = Math.round(dozens * 12);
    const endsForDistance = splitIntoChunks(scores.slice(0, arrowsPerDistance), endSize);
    scores = scores.slice(arrowsPerDistance);

    const roundBreakdown = [];
    let currentEnd = 0;

    for (const end of endsForDistance) {
      if (currentEnd % 2 === 0) {
        const firstEnd = end;
        const secondEnd = endsForDistance[currentEnd + 1] || [];
        const endScores = [...firstEnd, ...secondEnd];
        const subTotals = calculateSubtotals(endScores, gameType);
        subTotals.runningTotal = runningTotal + subTotals.totalScore;
        runningTotal = subTotals.runningTotal;
        roundBreakdown.push({ firstEnd, secondEnd, subTotals });
      }
      currentEnd++;
    }

    const scoresForDistance = endsForDistance.flat();
    const subTotals = calculateSubtotals(scoresForDistance, gameType);

    rounds.push({ roundBreakdown, subTotals });
  }

  return rounds;
}

export function calculateAverageScorePerEnd(scores, endSize, gameType) {
  const chunks = splitIntoChunks(scores, endSize);
  const wholeChunks = chunks.filter(c => c.length === endSize);
  const avg = calculateTotal(wholeChunks.map(end => calculateTotal(convertToValues(end, gameType)))) / wholeChunks.length;
  return Math.ceil(avg);
}
