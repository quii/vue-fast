import { splitIntoChunks } from "@/domain/splitter";
import { gameTypeConfig } from "@/domain/scoring/game_types";
import { calculateSubtotals, calculateTotal } from "@/domain/scoring/subtotals";
import { convertToValues } from "@/domain/scoring/scores";

export function calculateDistanceTotals(scores, gameType = "national", endSize = 6) {
  const config = gameTypeConfig[gameType];
  const { distancesRoundSizes } = config;
  const rounds = [];
  let runningTotal = 0;

  // Handle practice rounds or rounds without defined distancesRoundSizes
  if (!distancesRoundSizes ||
    (distancesRoundSizes.length === 1 && distancesRoundSizes[0] === 100)) {
    // For practice rounds, treat all arrows as a single distance
    const endsForDistance = splitIntoChunks(scores, endSize);
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

    const subTotals = calculateSubtotals(scores, gameType);
    rounds.push({ roundBreakdown, subTotals });

    return rounds;
  }

  // Original logic for standard rounds with defined distancesRoundSizes
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
